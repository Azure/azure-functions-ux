using System;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using Microsoft.Win32.SafeHandles;

namespace AzureFunctions.Authentication
{
    public static class NetworkHelper
    {
        internal const string Whack = @"\";
        internal const char WhackChar = '\\';
        internal const string AtSign = "@";
        internal const string Dot = ".";

        // UserName could be provided in any of the following forms:
        // 1. foo@redmond.corp.microsoft.com
        // 2. redmond\foo or redmond.corp.microsoft.com\foo
        // 3. .\foo
        // 4. foo
        //
        // WARNING: 
        // 1. If the user name is not fully qualified and default domain will be set to "." and will not be expanded to machine name.
        // 2. If you need to expand ".", use NetworkHelper.GetComputerName(ComputerNameFormat.DnsFullyQualified).
        public static NetworkCredential CreateCredential(string userName, string password)
        {
            if (string.IsNullOrEmpty(userName))
            {
                throw new ArgumentNullException("userName");
            }

            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException("password");
            }

            string parsedUserName;
            string domainName;
            ParseUserName(userName, out parsedUserName, out domainName);

            NetworkCredential credential = string.IsNullOrEmpty(domainName) && !IsUPNFormat(userName) ?
                new NetworkCredential(parsedUserName, password, ".") :
                new NetworkCredential(parsedUserName, password, domainName);

            return credential;
        }

        public static string GetUPNUser(string username, string domainName)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                throw new ArgumentNullException(username);
            }

            if (string.IsNullOrWhiteSpace(domainName))
            {
                return username;
            }

            return string.Concat(username, AtSign, domainName);
        }

        public static NetworkCredential CreateCredentialWithDomainUser(string userName, string password)
        {
            if (string.IsNullOrEmpty(userName))
            {
                throw new ArgumentNullException("userName");
            }

            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentNullException("password");
            }

            password = password.Trim();
            string parsedUserName;
            string domainName;
            ParseUserName(userName, out parsedUserName, out domainName);

            if (IsUPNFormat(parsedUserName))
            {
                string[] array = parsedUserName.Split(new string[] { AtSign }, StringSplitOptions.RemoveEmptyEntries);
                if (array.Length == 2)
                {
                    parsedUserName = array[0].Trim();
                    domainName = array[1].Trim();
                }
            }

            if (!string.IsNullOrWhiteSpace(domainName))
            {
                return new NetworkCredential(parsedUserName, password, domainName);
            }

            return new NetworkCredential(parsedUserName, password);
        }

        // userName could be of form
        // 1. foo@redmond.corp.microsoft.com
        // 2. redmond\foo or redmond.corp.microsoft.com\foo
        // 3. .\foo
        // 4. foo
        //
        // WARNING: 
        // 1. If the user name is not fully qualified, the domain will expanded to local fully qualified machine name.
        // 2. If the user name is in the form of .\foo, the domain will expanded to local machine name.
        public static string GetFullyQualifiedUserName(string userName)
        {
            if (string.IsNullOrEmpty(userName))
            {
                throw new ArgumentNullException("userName");
            }

            return GetFullyQualifiedUserName(userName, null);
        }

        // userName could be of form
        // 1. foo@redmond.corp.microsoft.com
        // 2. redmond\foo or redmond.corp.microsoft.com\foo
        // 3. .\foo
        // 4. foo
        //
        // WARNING: 
        // 1. If the user name is not fully qualified and the default domain is null, the domain will expanded to local fully qualified machine name.
        // 2. If the user name is in the form of .\foo, the domain will expanded to local fully qualified machine name.
        public static string GetFullyQualifiedUserName(string userName, string defaultDomain)
        {
            if (string.IsNullOrEmpty(userName))
            {
                throw new ArgumentNullException("userName");
            }

            if (IsUPNFormat(userName))
            {
                return userName;
            }

            string parsedUserName;
            string domainName;
            ParseUserName(userName, out parsedUserName, out domainName);
            if (string.IsNullOrEmpty(domainName))
            {
                domainName = string.IsNullOrEmpty(defaultDomain) ?
                    GetComputerName(ComputerNameFormat.DnsFullyQualified) :
                    defaultDomain;
            }

            if (string.IsNullOrEmpty(domainName) ||
                string.Compare(domainName, ".", StringComparison.Ordinal) == 0)
            {
                domainName = Environment.MachineName;
            }

            return string.Join(Whack, new string[] { domainName, parsedUserName });
        }

        public static string GetDownLevelLogonUserName(string userName)
        {
            return GetDownLevelLogonUserName(userName, null);
        }

        public static bool IsValidUser(string fullUserName, string password)
        {
            string username;
            string domainName;
            ParseUserName(fullUserName, out username, out domainName);

            SafeFileHandle logonToken = null;
            try
            {
                if (NativeMethods.LogonUser(
                        username,
                        domainName,
                        password,
                        NativeMethods.LOGON_TYPE.LOGON32_LOGON_INTERACTIVE,
                        NativeMethods.LogonProvider.LOGON32_PROVIDER_DEFAULT,
                        out logonToken))
                {
                    return true;
                }
            }
            finally
            {
                if (logonToken != null)
                {
                    logonToken.Dispose();
                }
            }

            return false;
        }

        public static string GetUniqueLogonUserName(string userName)
        {
            if (string.IsNullOrEmpty(userName))
            {
                throw new ArgumentNullException("userName");
            }

            string parsedUserName;
            string domainName;
            ParseUserName(userName, out parsedUserName, out domainName);

            if (IsUPNFormat(parsedUserName))
            {
                string[] userTokens = parsedUserName.Split(new string[] { AtSign }, StringSplitOptions.RemoveEmptyEntries);
                parsedUserName = userTokens[0];
                domainName = userTokens[1].Split(new string[] { Dot }, StringSplitOptions.RemoveEmptyEntries)[0];
            }
            else
            {
                if (string.IsNullOrEmpty(domainName) || string.Compare(domainName, Dot, StringComparison.Ordinal) == 0)
                {
                    domainName = GetComputerName(ComputerNameFormat.DnsFullyQualified);
                }

                domainName = domainName.Split(new string[] { Dot }, StringSplitOptions.RemoveEmptyEntries)[0];
            }

            domainName = domainName.ToLowerInvariant();
            parsedUserName = parsedUserName.ToLowerInvariant();

            return string.Join(Whack, new string[] { domainName, parsedUserName });
        }

        public static bool IsUPNFormat(string userName)
        {
            if (userName.Contains(AtSign))
            {
                return true;
            }

            return false;
        }

        public static bool IsDomainUser(string fullusername)
        {
            string username;
            string domainName;
            ParseUserName(fullusername, out username, out domainName);
            if (IsUPNFormat(fullusername) ||
                (!string.IsNullOrEmpty(domainName) &&
                !string.Equals(domainName, ".") &&
                !string.Equals(domainName, Environment.MachineName, StringComparison.OrdinalIgnoreCase)))
            {
                return true;
            }

            return false;
        }

        // userName could be of form
        // 1. foo@redmond.corp.microsoft.com
        // 2. redmond\foo or redmond.corp.microsoft.com\foo
        // 3. .\foo
        // 4. foo
        public static string GetDownLevelLogonUserName(string userName, string defaultDomain)
        {
            if (string.IsNullOrEmpty(userName))
            {
                throw new ArgumentNullException("userName");
            }

            string parsedUserName;
            string domainName;
            ParseUserName(userName, out parsedUserName, out domainName);
            if (string.IsNullOrEmpty(domainName))
            {
                if (!string.IsNullOrEmpty(defaultDomain))
                {
                    domainName = defaultDomain;
                }
            }

            if (string.IsNullOrEmpty(domainName) ||
                string.Compare(domainName, ".", StringComparison.Ordinal) == 0 ||
                string.Compare(domainName, GetComputerName(ComputerNameFormat.DnsFullyQualified), StringComparison.Ordinal) == 0)
            {
                domainName = GetComputerName(ComputerNameFormat.DnsHostname);
            }

            return string.Join(Whack, new string[] { domainName, parsedUserName });
        }

        // userName could be of form
        // 1. foo@redmond.corp.microsoft.com
        // 2. redmond\foo or redmond.corp.microsoft.com\foo
        // 3. .\foo
        // 4. foo
        //
        // WARNING: 
        // 1. If the user name is not fully qualified, the domainName will return null.
        // 2. If the user name is in the form of .\foo, the domain will expanded to local fully qualified machine name.
        public static void ParseUserName(
            string fullUserName,
            out string userName,
            out string domainName)
        {
            if (string.IsNullOrEmpty(fullUserName))
            {
                throw new ArgumentNullException("fullUserName");
            }

            domainName = null;
            userName = fullUserName;

            // if user is non domain joined or if its UPN return the username itself and set domain to null
            string[] userNameTokens = fullUserName.Split(new char[] { WhackChar }, StringSplitOptions.RemoveEmptyEntries);
            if (userNameTokens.Length == 2)
            {
                ParseDownLevelLogonUserName(fullUserName, out userName, out domainName);
            }
        }

        // userName could be of form
        // 1. redmond\foo or redmond.corp.microsoft.com\foo
        // 2. .\foo
        // 3. foo
        //
        // WARNING: 
        // 1. If the user name is not fully qualified, the domainName will return null.
        // 2. If the user name is in the form of .\foo, the domain will expanded to local fully qualified machine name.
        private static void ParseDownLevelLogonUserName(string fullUserName, out string userName, out string domainName)
        {
            string[] userNameTokens = fullUserName.Split(new char[] { '\\' }, StringSplitOptions.RemoveEmptyEntries);
            Debug.Assert(userNameTokens.Length == 2);
            domainName = userNameTokens.First();
            userName = userNameTokens.Last();
        }

        public static string GetComputerDomainName()
        {
            return GetComputerName(ComputerNameFormat.DnsDomain);
        }

        // GetComputerNameEx function
        // http://msdn.microsoft.com/en-us/library/windows/desktop/ms724301(v=vs.85).aspx
        public static string GetComputerName(ComputerNameFormat format)
        {
            StringBuilder builder = new StringBuilder(260);
            int size = builder.Capacity;
            if (!NativeMethods.GetComputerNameEx(format, builder, ref size))
            {
                Marshal.ThrowExceptionForHR(Marshal.GetHRForLastWin32Error());
            }

            return builder.ToString();
        }

        public static void ParseComputerName(string fullComputerName,
            out string computerName,
            out string domainName)
        {
            domainName = null;
            computerName = fullComputerName;
            int index = fullComputerName.IndexOf('.');
            if (index > 0 && fullComputerName.Length > (index + 1))
            {
                computerName = fullComputerName.Substring(0, index);
                domainName = fullComputerName.Substring(index + 1);
            }
        }

        // NOTE: some IPv6-related methods are copied from WFF
        // "New Networking Features in Windows Server 2008 and Windows Vista"
        //      http://technet.microsoft.com/en-us/library/bb726965.aspx
        public static string GetMachineNameForUnc(string agentAddress)
        {
            // UNC names don’t support colons or the percent sign. 
            // To enable IPv6 address in UNC names Microsoft worked around this by implementing IPv6 Literal Names.
            // 1. Replace colons ':' with dashes '-'
            // 2. Remove square brackets (replace "[" and "]" with "") in case they were added
            // 3. Replace percent sign '%' with the letter 's'. (Only necessary when using a link-local IPv6 address).
            // 4. Append .ipv6-literal.net at the end of the IPv6 address

            return IsIPv6Address(agentAddress) ?
                agentAddress
                    .Replace(':', '-')
                    .Replace("[", string.Empty)
                    .Replace("]", string.Empty)
                    .Replace('%', 's') +
                    ".ipv6-literal.net" :
                agentAddress;
        }

        public static bool TryParseIPAddress(string address, out IPAddress ipAddress)
        {
            if (string.IsNullOrEmpty(address))
            {
                ipAddress = null;
                return false;
            }
            return IPAddress.TryParse(address
                .Replace(".ipv6-literal.net", "")
                .Replace('-', ':')
                .Replace('s', '%')
                .Replace("[", "")
                .Replace("]", ""), out ipAddress);
        }

        /// <summary>
        /// Wraps IPv6 addresses in square brackets, everything else is returned as is
        /// </summary>
        /// <param name="machineName">Machine name, FQDN, IPv4 or IPv6 address</param>
        /// <returns>Value to be used in HTTP requests or stored in the database</returns>
        public static string GetMachineNameForHttpRequestAndDatabase(string machineName)
        {
            // Name is a part of the URL, hence cannot include ':', a character used in IPv6 address form.
            // That's why IPv6 addresses are passed with ipv6-literal.net name
            // See http://technet.microsoft.com/en-us/library/bb726965.aspx
            IPAddress address;
            if (TryParseIPAddress(machineName, out address) && IsIPv6Address(address))
            {
                return string.Concat("[", address.ToString(), "]");
            }

            return machineName;
        }

        public static bool IsIPv6Address(IPAddress address)
        {
            return address.AddressFamily == AddressFamily.InterNetworkV6;
        }

        public static bool IsIPv6Address(string address)
        {
            try
            {
                IPAddress ipAddress;
                return IPAddress.TryParse(address, out ipAddress) && IsIPv6Address(ipAddress);
            }
            catch (ArgumentException)
            {
                // ipString can't contain Unicode characters
                return false;
            }
        }

        public static IPAddress GetIPAddress(AddressFamily addressFamily)
        {
            string computerName = GetComputerName(ComputerNameFormat.DnsFullyQualified);

            IPHostEntry entry = Dns.GetHostEntry(computerName);
            foreach (IPAddress ipAddress in entry.AddressList)
            {
                if (ipAddress.AddressFamily == addressFamily)
                {
                    return ipAddress;
                }
            }

            return null;
        }
    }
}
