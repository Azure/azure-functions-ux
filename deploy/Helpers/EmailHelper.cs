using System;
using System.Linq;
using MailKit.Net.Smtp;
using MimeKit;

namespace Deploy.Helpers
{
    public static class EmailHelpers
    {
        public static void EmailFailedRun()
        {
            StaticLogger.WriteLine("In EmailFailedRun");
            SendEmail($"{DeploySettings.AppName} Deployment Failed");
        }

        public static void EmailSuccessfulRun()
        {
            StaticLogger.WriteLine("In EmailSuccessfulRun");
            SendEmail($"{DeploySettings.AppName} Deployment succeeded");
        }

        private static void SendEmail(string subject)
        {
            var emailList = DeploySettings.ToEmailList;
            var message = new MimeMessage ();
            message.From.Add(new MailboxAddress(DeploySettings.FromEmail));
            message.To.AddRange(DeploySettings
                .ToEmailList
                .Split(new [] { ';' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(a => a.Trim())
                .Select(alias => $"{alias}@microsoft.com")
                .Select(e => new MailboxAddress(e)));
            message.Subject = subject;

            var body = new TextPart("plain")
            {
                Text = "Deployment log is attached"
            };

            var attachment = new MimePart("text/plain")
            {
                ContentObject = new ContentObject(StaticLogger.Log.ToStream(), ContentEncoding.Default),
                ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
                ContentTransferEncoding = ContentEncoding.Default,
                FileName = "deployment.log"
            };

            var multipart = new Multipart("mixed");
            multipart.Add(body);
            multipart.Add(attachment);

            message.Body = multipart;

            using (var client = new SmtpClient())
            {
                client.Connect(DeploySettings.EmailServer, 587);

                // From MailKit sample:
                // Note: since we don't have an OAuth2 token, disable
                // the XOAUTH2 authentication mechanism.
                client.AuthenticationMechanisms.Remove ("XOAUTH2");

                client.Authenticate(DeploySettings.EmailUserName, DeploySettings.EmailPassword);

                client.Send(message);
                client.Disconnect(true);
            }
        }
    }
}