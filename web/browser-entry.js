const PrivacyPolicyGenerator = require('../js/generator');
const TermsGenerator = require('../js/terms-generator');
const DataDeletionGenerator = require('../js/deletion-generator');
const CookiesPolicyGenerator = require('../js/cookies-generator');
const ReturnRefundPolicyGenerator = require('../js/refund-generator');
const DisclaimerGenerator = require('../js/disclaimer-generator');
const SecurityPolicyGenerator = require('../js/security-generator');
const DataProcessingAgreementGenerator = require('../js/dpa-generator');
const AiPolicyGenerator = require('../js/ai-policy-generator');
const EulaGenerator = require('../js/eula-generator');
const docx = require('docx');

globalThis.LegalGenerators = {
  PrivacyPolicyGenerator,
  TermsGenerator,
  DataDeletionGenerator,
  CookiesPolicyGenerator,
  ReturnRefundPolicyGenerator,
  DisclaimerGenerator,
  SecurityPolicyGenerator,
  DataProcessingAgreementGenerator,
  AiPolicyGenerator,
  EulaGenerator
};

globalThis.LegalDocx = docx;
