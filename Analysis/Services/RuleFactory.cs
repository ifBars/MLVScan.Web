using MLVScan.Models;
using MLVScan.Models.Rules;

namespace MLVScan.Services
{
    public static class RuleFactory
    {
        public static List<IScanRule> CreateRules()
        {
            return new List<IScanRule>
            {
                new Base64Rule(),
                new ProcessStartRule(),
                new Shell32Rule(),
                new LoadFromStreamRule(),
                new ByteArrayManipulationRule(),
                new DllImportRule(),
                new RegistryRule(),
                new EncodedStringLiteralRule(),
                new ReflectionRule(),
                new EnvironmentPathRule(),
                new EncodedStringPipelineRule(),
                new EncodedBlobSplittingRule(),
                new COMReflectionAttackRule(),
                new DataExfiltrationRule(),
                new PersistenceRule(),
                new HexStringRule()
            };
        }
    }
}
