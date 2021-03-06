import * as vscode from 'vscode';
import * as nls from 'vscode-nls';

import {QbsSession} from './qbssession';
import {QbsOperationStatus, QbsOperationType, QbsMessageResponse} from './qbstypes';

const localize = nls.config({ messageFormat: nls.MessageFormat.file })();

export class QbsSessionLogger implements vscode.Disposable {
    private _compileOutput: vscode.OutputChannel;
    private _messageOutput: vscode.OutputChannel;

    constructor(session: QbsSession) {
        this._compileOutput = vscode.window.createOutputChannel('QBS Compile Output');
        this._messageOutput = vscode.window.createOutputChannel('QBS Message Output');

        const appendCompileText = async (text: string) => {
            this._compileOutput.show();
            this._compileOutput.appendLine(text);
        };

        const appendMessageText = async (text: string) => {
            this._messageOutput.appendLine(text);
        };

        const appendCompileOutput = async (result: QbsMessageResponse) => {
            if (!result.isEmpty()) {
                await appendCompileText(result.toString());
            }
        };

        session.onProjectResolved(async (result) => await appendCompileOutput(result));
        session.onProjectBuilt(async (result) => await appendCompileOutput(result));
        session.onProjectCleaned(async (result) => await appendCompileOutput(result));
        session.onProjectInstalled(async (result) => await appendCompileOutput(result));
        session.onCommandDescriptionReceived(async (result) => await appendCompileOutput(result));
        session.onRunEnvironmentResultReceived(async (result) => await appendCompileOutput(result));
        session.onWarningMessageReceived(async (result) => await appendCompileOutput(result))

        session.onTaskStarted(async (result) => {
            if (result._description) {
                await appendCompileText(result._description);
            }
        });

        session.onProcessResultReceived(async (result) => {
            const hasOutput = result._stdOutput.length || result._stdError.length;
            if (result._success && !hasOutput) {
                return;
            }
            const exe = `${result._executable} ${result._arguments.join(' ')}`;
            await appendCompileText(exe);
            if (result._stdError.length) {
                const text = result._stdError.join('\n');
                await appendCompileText(text);
            }
            if (result._stdOutput.length) {
                const text = result._stdOutput.join('\n');
                await appendCompileText(text);
            }
        });

        session.onLogMessageReceived(async (result) => {
            if (!result.isEmpty()) {
                const text = `[qbs] ${result.toString()}`;
                await appendMessageText(text);
            }
        });

        session.onOperationChanged(async (operation) => {
            if (operation._type === QbsOperationType.Resolve) {
                if (operation._status === QbsOperationStatus.Started) {
                    const text = localize('qbs.session.logger.resolve.message', 'Resolving project...');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Completed) {
                    const text = localize('qbs.session.logger.resolve.completed.message', 'Project successfully resolved')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Failed) {
                    const text = localize('qbs.session.logger.resolve.failed.message', 'Error resolving project')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                }
            } else if (operation._type === QbsOperationType.Build) {
                if (operation._status === QbsOperationStatus.Started) {
                    const text = localize('qbs.session.logger.build.message', 'Building project...');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Completed) {
                    const text = localize('qbs.session.logger.build.completed.message', 'Project successfully built')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Failed) {
                    const text = localize('qbs.session.logger.build.failed.message', 'Error building project')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                }
            } else if (operation._type === QbsOperationType.Clean) {
                if (operation._status === QbsOperationStatus.Started) {
                    const text = localize('qbs.session.logger.clean.message', 'Cleaning project...');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Completed) {
                    const text = localize('qbs.session.logger.clean.completed.message', 'Project successfully cleaned')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Failed) {
                    const text = localize('qbs.session.logger.clean.failed.message', 'Error cleaning project')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                }
            } else if (operation._type === QbsOperationType.Install) {
                if (operation._status === QbsOperationStatus.Started) {
                    const text = localize('qbs.session.logger.install.message', 'Installing project...');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Completed) {
                    const text = localize('qbs.session.logger.install.completed.message', 'Project successfully installed')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                } else if (operation._status === QbsOperationStatus.Failed) {
                    const text = localize('qbs.session.logger.install.failed.message', 'Error installing project')
                        + localize('qbs.session.logger.elapsed.message', ', elapsed time: ')
                        + `${operation._elapsed}`
                        + localize('qbs.session.logger.msecs.message', ' msecs.');
                    await appendCompileText(text);
                }
            }
        });
    }

    dispose() {}
}
