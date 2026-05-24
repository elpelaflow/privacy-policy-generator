const PrivacyPolicyGenerator = require('../js/generator');
const TermsGenerator = require('../js/terms-generator');
const DataDeletionGenerator = require('../js/deletion-generator');
const CookiesPolicyGenerator = require('../js/cookies-generator');
const ReturnRefundPolicyGenerator = require('../js/refund-generator');
const DisclaimerGenerator = require('../js/disclaimer-generator');
const SecurityPolicyGenerator = require('../js/security-generator');
const DataProcessingAgreementGenerator = require('../js/dpa-generator');

globalThis.LegalGenerators = {
  PrivacyPolicyGenerator,
  TermsGenerator,
  DataDeletionGenerator,
  CookiesPolicyGenerator,
  ReturnRefundPolicyGenerator,
  DisclaimerGenerator,
  SecurityPolicyGenerator,
  DataProcessingAgreementGenerator
};
