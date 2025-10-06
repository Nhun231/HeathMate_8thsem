const origLog = console.log;
const origError = console.error;
const origWarn = console.warn;

beforeEach(() => {
  // Spy on console methods and prefix logs with current test name
  jest.spyOn(console, 'log').mockImplementation((...args: any[]) => {
    const testName = expect.getState().currentTestName || 'unknown-test';
    origLog(`[${testName}]`, ...args);
  });

  jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
    const testName = expect.getState().currentTestName || 'unknown-test';
    origError(`[${testName}]`, ...args);
  });

  jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    const testName = expect.getState().currentTestName || 'unknown-test';
    origWarn(`[${testName}]`, ...args);
  });
});

afterEach(() => {
  // Restore mocks so other suites are unaffected
  (console.log as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
  (console.warn as jest.Mock).mockRestore();
});
