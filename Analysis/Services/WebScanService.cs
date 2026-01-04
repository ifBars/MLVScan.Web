using System.Security.Cryptography;
using Microsoft.AspNetCore.Components.Forms;
using MLVScan;
using MLVScan.Models;
using MLVScan.Services;

namespace MLVScan.Web.Services
{
    /// <summary>
    /// Web-specific scan service that wraps the Core AssemblyScanner
    /// for handling file uploads in the Blazor WebAssembly context.
    /// </summary>
    public class WebScanService
    {
        private readonly AssemblyScanner _scanner;
        private readonly HashSet<string> _ignoredHashes;

        public WebScanService()
        {
            var config = new ScanConfig();
            var rules = RuleFactory.CreateDefaultRules();
            _scanner = new AssemblyScanner(rules, config);
            
            // Known safe mods that trigger false positives
            _ignoredHashes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                // CustomTV
                "3918e1454e05de4dd3ace100d8f4d53936c9b93694dbff5bcc0293d689cb0ab7",
                "8e6dd1943c80e2d1472a9dc2c6722226d961027a7ec20aab9ad8f1184702d138",
                
                // UnityExplorer
                "d47eb6eabd3b6e3b742c7d9693651bc3a61a90dcbe838f9a4276953089ee4951",
                "cfe43c0d285867a5701d96de1edd25cb02725fe2629b88386351dc07b11a08b5"
            };
        }

        public async Task<ScanResult> ScanAsync(IBrowserFile file, CancellationToken cancellationToken = default)
        {
            if (file == null) throw new ArgumentNullException(nameof(file));

            await using var uploadStream = file.OpenReadStream(maxAllowedSize: 50 * 1024 * 1024, cancellationToken: cancellationToken);
            await using var memory = new MemoryStream();
            await uploadStream.CopyToAsync(memory, cancellationToken);
            memory.Position = 0;

            var hash = ComputeSha256(memory);
            
            // Check if this file is in the ignored list
            if (_ignoredHashes.Contains(hash))
            {
                // Return empty findings for whitelisted files
                return new ScanResult(file.Name, hash, Enumerable.Empty<ScanFinding>());
            }
            
            memory.Position = 0;

            var findings = _scanner.Scan(memory, file.Name).ToList();
            return new ScanResult(file.Name, hash, findings);
        }

        private static string ComputeSha256(Stream stream)
        {
            using var sha = SHA256.Create();
            var hash = sha.ComputeHash(stream);
            return BitConverter.ToString(hash).Replace("-", string.Empty).ToLowerInvariant();
        }
    }
}
