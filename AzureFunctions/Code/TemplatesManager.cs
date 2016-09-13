using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reactive.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Hosting;
using AzureFunctions.Code.Extensions;
using AzureFunctions.Common;
using AzureFunctions.Contracts;
using AzureFunctions.Models;
using AzureFunctions.Trace;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AzureFunctions.Code
{
    public class TemplatesManager : ITemplatesManager
    {
        private readonly ISettings _settings;
        private readonly FileSystemWatcher _fileSystemWatcher;
        private readonly IObservable<FileSystemEventArgs> _fileSystemObservable;
        private IEnumerable<FunctionTemplate> _templates = Enumerable.Empty<FunctionTemplate>();
        private ReaderWriterLockSlim _lock = new ReaderWriterLockSlim();

        public TemplatesManager(ISettings settings)
        {
            this._settings = settings;
            this._fileSystemWatcher = new FileSystemWatcher
            {
                IncludeSubdirectories = true,
                Path = _settings.TemplatesPath,
                Filter = "*.*",
                NotifyFilter = NotifyFilters.LastWrite
            };
            this._fileSystemObservable =
                Observable.FromEventPattern<FileSystemEventHandler, FileSystemEventArgs>(
                    handler =>
                    {
                        _fileSystemWatcher.Changed += handler;
                        _fileSystemWatcher.Created += handler;
                        _fileSystemWatcher.Deleted += handler;
                    },
                    handler =>
                    {
                        _fileSystemWatcher.Changed -= handler;
                        _fileSystemWatcher.Created -= handler;
                        _fileSystemWatcher.Deleted -= handler;
                    })
                    .Throttle(TimeSpan.FromSeconds(5))
                    .Select(e => e.EventArgs);
            this._fileSystemObservable.Subscribe(e => HostingEnvironment.QueueBackgroundWorkItem(_ => HandleFileSystemChange()));
            this._fileSystemWatcher.EnableRaisingEvents = true;
            HostingEnvironment.QueueBackgroundWorkItem(_ => HandleFileSystemChange());
        }

        private void HandleFileSystemChange()
        {
            if (_lock.TryEnterWriteLock(Timeout.Infinite))
            {
                try
                {
                    var runtimeDirs = Directory.GetDirectories(_settings.TemplatesPath);
                    var templateDirs = new List<string>();

                    foreach (var d in runtimeDirs)
                    {
                        templateDirs.AddRange(Directory.GetDirectories(Path.Combine(d, "Templates")));
                    }

                    IEnumerable<FunctionTemplate> templates = templateDirs.Select(GetFunctionTemplate).ToList();

                    templates = templates.Where(e => e != null).ToList();
                    _templates = templates;
                }
                finally
                {
                    _lock.ExitWriteLock();
                }
            }
        }

        private FunctionTemplate GetFunctionTemplate(string templateFolderName)
        {
            var templateDir = Path.Combine(_settings.TemplatesPath, templateFolderName);
            var metadataPath = Path.Combine(templateDir, "metadata.json");
            var functionPath = Path.Combine(templateDir, "function.json");
            if (File.Exists(metadataPath) && File.Exists(functionPath))
            {
                try
                {
                    var template = new FunctionTemplate()
                    {
                        Files = new Dictionary<string, string>()
                    };
                    template.Metadata = JObject.Parse(FileSystemHelpers.ReadAllTextFromFile(metadataPath));
                    template.Function = JObject.Parse(FileSystemHelpers.ReadAllTextFromFile(functionPath));
                    var splits = templateFolderName.Split('\\');
                    template.Runtime = splits[splits.Length - 3];
                    template.Id = splits[splits.Length - 1];

                    var files = Directory.EnumerateFiles(templateDir).Where((fileName) =>
                    {
                        return fileName != metadataPath && fileName != functionPath;
                    });

                    foreach (var fileName in files)
                    {
                        var fileContent = File.ReadAllText(fileName);
                        template.Files.Add(Path.GetFileName(fileName), fileContent);
                    }

                    return template;
                }
                catch (Exception e)
                {
                    FunctionsTrace.Diagnostics.Event(TracingEvents.ErrorInGetFunctionTemplate, templateFolderName, e.Message);
                    return null;
                }
            }
            return null;
        }

        public IEnumerable<FunctionTemplate> GetTemplates(string runtime)
        {
            if (_lock.TryEnterReadLock(Timeout.Infinite))
            {
                try
                {
                    return _templates.Any(t => t.Runtime == runtime)
                        ? _templates.Where(t => t.Runtime == runtime)
                        : _templates.Where(t => t.Runtime == "default");
                }
                finally
                {
                    _lock.ExitReadLock();
                }
            }
            else
            {
                return Enumerable.Empty<FunctionTemplate>();
            }
        }

        public async Task<Dictionary<string, string>> GetTemplateContentAsync(string templateId)
        {
            var templatePath = Path.Combine(_settings.TemplatesPath, templateId);
            if (!Directory.Exists(templatePath)) return null;

            var content = await Directory
                .GetFiles(templatePath)
                .Where(p => !p.EndsWith(Constants.MetadataJson))
                .Select(async p => new { FileName = Path.GetFileName(p), Content = await FileSystemHelpers.ReadAllTextFromFileAsync(p) })
                .WhenAll();
            return content.ToDictionary(k => k.FileName, v => v.Content);
        }

        public async Task<JObject> GetBindingConfigAsync(string runtime)
        {
            string runtimeFolder = Path.Combine(_settings.TemplatesPath, runtime);
            if (!Directory.Exists(runtimeFolder))
            {
                runtimeFolder = Path.Combine(_settings.TemplatesPath, "default");
            }
            var result = JsonConvert.DeserializeObject<JObject>(await FileSystemHelpers.ReadAllTextFromFileAsync(Path.Combine(runtimeFolder, "Bindings\\bindings.json")));
            AddReferencesContent(result, runtimeFolder);
            return result;
        }

        private JObject AddReferencesContent(JObject jo, string runtimeForlder)
        {
            foreach (var x in jo)
            {
                string name = x.Key;

                JToken value = x.Value;
                var obj = value.ToObject<object>();

                if (obj is String)
                {
                    string file = obj.ToString();
                    if (file.StartsWith("$content="))
                    {
                        file = Path.Combine(runtimeForlder, file.Replace("$content=", ""));
                        if (File.Exists(file))
                        {
                            var content = File.ReadAllText(file);
                            jo[name] = content;
                        }
                    }
                }
                else if (obj is JObject)
                {
                    AddReferencesContent((JObject)obj, runtimeForlder);
                }
                else if (obj is JArray)
                {
                    foreach (var arrayItem in (JArray)obj)
                    {
                        if (arrayItem is JObject)
                        {
                            AddReferencesContent(arrayItem.Value<JObject>(), runtimeForlder);
                        }
                    }
                    jo[name] = (JArray)obj;
                }
            }

            return jo;
        }
    }
}