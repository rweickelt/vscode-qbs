import * as vscode from 'vscode';

import { create } from 'domain';
import { basename } from 'path';

import {QbsSession} from './qbssession';
import {StatusBar} from './statusbar';

let qbsSession: QbsSession|null = null;
let statusBar: StatusBar|null = null;

export function activate(extensionContext: vscode.ExtensionContext) {
    console.log('Extension "qbs-tools" is now active!');

    // Create the QBS session.
    qbsSession = QbsSession.create(extensionContext);
    // Create the status bar.
    statusBar = StatusBar.create(qbsSession);

    const selectProjectCmd = vscode.commands.registerCommand('qbs.selectProject', () => {
        selectProject().then(projectUri => {
            console.debug('qbs: selectProject: ' + projectUri);
            if (projectUri && qbsSession)
                qbsSession.projectUri = projectUri;
        });
    });
    extensionContext.subscriptions.push(selectProjectCmd);

    const selectProfileCmd = vscode.commands.registerCommand('qbs.selectProfile', () => {
        selectProfile().then(profileName => {
            console.debug('qbs: selectProfile: ' + profileName);
            if (profileName && qbsSession)
                qbsSession.profileName = profileName;
        });
    });
    extensionContext.subscriptions.push(selectProfileCmd);

    const selectConfigurationCmd = vscode.commands.registerCommand('qbs.selectConfiguration', () => {
        selectConfiguration().then(configurationName => {
            console.debug('qbs: selectConfiguration: ' + configurationName);
            if (configurationName && qbsSession)
                qbsSession.configurationName = configurationName;
        });
    });
    extensionContext.subscriptions.push(selectConfigurationCmd);

    const configureCmd = vscode.commands.registerCommand('qbs.configure', () => {
        vscode.window.showInformationMessage('QBS: configure');
    });
    extensionContext.subscriptions.push(configureCmd);

    const buildCmd = vscode.commands.registerCommand('qbs.build', () => {
        vscode.window.showInformationMessage('QBS: build');
    });
    extensionContext.subscriptions.push(buildCmd);

    const cleanCmd = vscode.commands.registerCommand('qbs.clean', () => {
        vscode.window.showInformationMessage('QBS: clean');
    });
    extensionContext.subscriptions.push(cleanCmd);
}

export function deactivate() {}

async function selectProject(): Promise<vscode.Uri | undefined> {
    interface ProjectQuickPickItem extends vscode.QuickPickItem {
        uri: vscode.Uri;
    }
    const projectUris = await vscode.workspace.findFiles('*.qbs');
    const items: ProjectQuickPickItem[] = projectUris.map(projectUri => {
        return {
            label: basename(projectUri.fsPath),
            uri: projectUri
        };
    });
    return await vscode.window.showQuickPick(items).then(item => {
        return item ? item.uri : undefined;
    });
}

async function selectProfile(): Promise<string | undefined> {
    interface ProfileQuickPickItem extends vscode.QuickPickItem {
        //
    }
    const profileNames: string[] = ['msvc', 'gcc'];
    const items: ProfileQuickPickItem[] = profileNames.map(profileName => {
        return {
            label: profileName
        };
    });
    return await vscode.window.showQuickPick(items).then(item => {
        return item ? item.label : undefined;
    });
}

async function selectConfiguration(): Promise<string | undefined> {
    interface ConfigurationQuickPickItem extends vscode.QuickPickItem {
        //
    }
    const configurationNames: string[] = ['debug', 'release'];
    const items: ConfigurationQuickPickItem[] = configurationNames.map(configurationName => {
        return {
            label: configurationName
        };
    });
    return await vscode.window.showQuickPick(items).then(item => {
        return item ? item.label : undefined;
    });
}
