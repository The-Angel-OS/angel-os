import { PaymentResult, BrowserTask, BrowserTaskResult, EthicalAssessment } from './browser-automation';

export interface ComplianceLogger {
  logError(error: unknown): Promise<string>
  logPaymentTransaction(result: PaymentResult): Promise<string>
  logBrowserTask(task: BrowserTask, result: BrowserTaskResult): Promise<void>
  logEthicalAssessment(assessment: EthicalAssessment): Promise<string>
}
