using System.Collections.ObjectModel;

namespace MLVScan.Models
{
    public class ScanResult
    {
        public string FileName { get; }
        public string Sha256 { get; }
        public ReadOnlyCollection<ScanFinding> Findings { get; }

        public ScanResult(string fileName, string sha256, IEnumerable<ScanFinding> findings)
        {
            FileName = fileName;
            Sha256 = sha256;
            Findings = new ReadOnlyCollection<ScanFinding>(findings?.ToList() ?? new List<ScanFinding>());
        }
    }
}
