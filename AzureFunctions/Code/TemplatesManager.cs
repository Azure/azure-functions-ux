using AzureFunctions.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AzureFunctions.Models;
using System.Threading.Tasks;
using System.IO;
using System.Reactive.Linq;
using AzureFunctions.Code.Extensions;
using System.Threading;
using AzureFunctions.Trace;
using Newtonsoft.Json;
using System.Web.Hosting;

namespace AzureFunctions.Code
{
    public class TemplatesManager : ITemplatesManager
    {
        private readonly ISettings _settings;
        private readonly FileSystemWatcher _fileSystemWatcher;
        private readonly IObservable<FileSystemEventArgs> _fileSystemObservable;
        private readonly ReaderWriterLockSlim _rwlock;
        private IEnumerable<FunctionTemplate> _templates = Enumerable.Empty<FunctionTemplate>();

        public TemplatesManager(ISettings settings)
        {
            this._settings = settings;
            this._rwlock = new ReaderWriterLockSlim();
            this._fileSystemWatcher = new FileSystemWatcher
            {
                Path = _settings.TemplatesPath,
                NotifyFilter = NotifyFilters.LastWrite,
                IncludeSubdirectories = true
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

        private async Task HandleFileSystemChange()
        {
            IEnumerable<FunctionTemplate> templates = await Directory
                .GetDirectories(_settings.TemplatesPath)
                .Select(Path.GetFileName)
                .Select(GetFunctionTemplate)
                .WhenAll();
            templates = templates.Where(e => e != null);
            _rwlock.EnterWriteLock();
            try { _templates = templates; }
            finally { _rwlock.ExitWriteLock(); }
        }

        private async Task<FunctionTemplate> GetFunctionTemplate(string templateFolderName)
        {
            var templatePath = Path.Combine(_settings.TemplatesPath, templateFolderName, "metadata.json");
            if (File.Exists(templatePath))
            {
                try
                {
                    using (var streamReader = new StreamReader(File.OpenRead(templatePath)))
                    {
                        var template = JsonConvert.DeserializeObject<FunctionTemplate>(await streamReader.ReadToEndAsync());
                        template.Id = templateFolderName;
                        return template;
                    }
                }
                catch (Exception e)
                {
                    FunctionsTrace.Diagnostics.Error($"Error in GetFunctionTemplate({templateFolderName}), {{Exception}}", e.Message);
                    return null;
                }
            }
            return null;
        }

        public IEnumerable<FunctionTemplate> GetTemplates()
        {
            _rwlock.EnterReadLock();
            try { return _templates; }
            finally { _rwlock.ExitReadLock(); }
        }
    }
}