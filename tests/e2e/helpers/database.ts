import { t } from 'testcafe';
import { AddNewDatabaseParameters, SentinelParameters, OSSClusterParameters } from '../pageObjects/add-redis-database-page';
import { DiscoverMasterGroupsPage } from '../pageObjects/sentinel/discovered-sentinel-master-groups-page';
import {
    MyRedisDatabasePage,
    BrowserPage,
    AutoDiscoverREDatabases,
    AddRedisDatabasePage,
    UserAgreementPage,
    CliPage
} from '../pageObjects';
import { addNewStandaloneDatabaseApi, discoverSentinelDatabaseApi } from './api/api-database';
import { Common } from './common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const discoverMasterGroupsPage = new DiscoverMasterGroupsPage();
const autoDiscoverREDatabases = new AutoDiscoverREDatabases();
const browserPage = new BrowserPage();
const userAgreementPage = new UserAgreementPage();
const cliPage = new CliPage();
const common = new Common();

/**
 * Add a new database manually using host and port
 * @param databaseParameters The database parameters
 */
export async function addNewStandaloneDatabase(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    //Fill the add database form
    await addRedisDatabasePage.addRedisDataBase(databaseParameters);
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Wait for database to be exist
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseParameters.databaseName ?? '').exists).ok('The existence of the database', { timeout: 10000 });
    //Close message
    await t.click(myRedisDatabasePage.toastCloseButton);
}

/**
 * Add a new database via autodiscover using Sentinel option
 * @param databaseParameters The Sentinel parameters: host, port and sentinel password
 */
export async function discoverSentinelDatabase(databaseParameters: SentinelParameters): Promise<void> {
    // Fill sentinel parameters to auto-discover Master Groups
    await addRedisDatabasePage.discoverSentinelDatabases(databaseParameters);
    // Click for autodiscover
    await t
        .click(addRedisDatabasePage.discoverSentinelDatabaseButton)
        .expect(discoverMasterGroupsPage.addPrimaryGroupButton.exists).ok('Verify that user is on the second step of Sentinel flow', { timeout: 10000 });
    // Select Master Groups and Add to RedisInsight
    await discoverMasterGroupsPage.addMasterGroups();
    await t.click(autoDiscoverREDatabases.viewDatabasesButton);
}

/**
 * Add a new database from RE Cluster via auto-discover flow
 * @param databaseParameters The database parameters
 */
export async function addNewREClusterDatabase(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    //Fill the add database form
    await addRedisDatabasePage.addAutodiscoverREClucterDatabase(databaseParameters);
    //Click on submit button
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Wait for database to be exist in the list of Autodiscover databases and select it
    await t.expect(autoDiscoverREDatabases.databaseNames.withExactText(databaseParameters.databaseName ?? '').exists).ok('The existence of the database', { timeout: 10000 });
    await t.typeText(autoDiscoverREDatabases.search, databaseParameters.databaseName ?? '');
    await t.click(autoDiscoverREDatabases.databaseCheckbox);
    //Click Add selected databases button
    await t.click(autoDiscoverREDatabases.addSelectedDatabases);
    await t.click(autoDiscoverREDatabases.viewDatabasesButton);
}

/**
 * Add a new database from OSS Cluster via auto-discover flow
 * @param databaseParameters The database parameters
 */
export async function addOSSClusterDatabase(databaseParameters: OSSClusterParameters): Promise<void> {
    //Enter required parameters for OSS Cluster
    await addRedisDatabasePage.addOssClusterDatabase(databaseParameters);
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Check for info message that DB was added
    await t.expect(myRedisDatabasePage.databaseInfoMessage.exists).ok('Check that info message exists', { timeout: 10000 });
    //Wait for database to be exist
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseParameters.ossClusterDatabaseName).exists).ok('The existence of the database', { timeout: 10000 });
}

/**
 * Add a new database from Redis Enterprise Cloud via auto-discover flow
 * @param cloudAPIAccessKey The Cloud API Access Key
 * @param cloudAPISecretKey The Cloud API Secret Key
 */
export async function addNewRECloudDatabase(cloudAPIAccessKey: string, cloudAPISecretKey: string): Promise<string> {
    //Fill the add database form and Submit
    await addRedisDatabasePage.addAutodiscoverRECloudDatabase(cloudAPIAccessKey, cloudAPISecretKey);
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    //Select subscriptions
    await t.click(addRedisDatabasePage.selectAllCheckbox);
    await t.click(addRedisDatabasePage.showDatabasesButton);
    //Select databases for adding
    const databaseName = await browserPage.getDatabasesName();
    await t.click(addRedisDatabasePage.selectAllCheckbox);
    await t.click(autoDiscoverREDatabases.addSelectedDatabases);
    //Wait for database to be exist in the My redis databases list
    await t.click(autoDiscoverREDatabases.viewDatabasesButton);
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseName).exists).ok('The existence of the database', { timeout: 10000 });
    return databaseName;
}

/**
 * Accept License terms and add database
 * @param databaseParameters The database parameters
 * @param databaseName The database name
*/
export async function acceptLicenseTermsAndAddDatabase(databaseParameters: AddNewDatabaseParameters, databaseName: string): Promise<void> {
    await acceptLicenseTerms();
    await addNewStandaloneDatabase(databaseParameters);
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(databaseName);
}

/**
 * Accept License terms and add database using api
 * @param databaseParameters The database parameters
 * @param databaseName The database name
*/
export async function acceptLicenseTermsAndAddDatabaseApi(databaseParameters: AddNewDatabaseParameters, databaseName: string): Promise<void> {
    await acceptLicenseTerms();
    await addNewStandaloneDatabaseApi(databaseParameters);
    // Reload Page to see the new added database through api
    await common.reloadPage();
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(databaseName);
}

/**
 * Accept License terms and add OSS cluster database
 * @param databaseParameters The database parameters
 * @param databaseName The database name
*/
export async function acceptLicenseTermsAndAddOSSClusterDatabase(databaseParameters: OSSClusterParameters, databaseName: string): Promise<void> {
    await acceptLicenseTerms();
    await addOSSClusterDatabase(databaseParameters);
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(databaseName);
}

/**
 * Accept License terms and add Sentinel database using api
 * @param databaseParameters The database parameters
*/
export async function acceptLicenseTermsAndAddSentinelDatabaseApi(databaseParameters: SentinelParameters): Promise<void> {
    await acceptLicenseTerms();
    await discoverSentinelDatabaseApi(databaseParameters);
    // Reload Page to see the database added through api
    await common.reloadPage();
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(databaseParameters.name[1] ?? '');
}

/**
 * Accept License terms and add RE Cluster database
 * @param databaseParameters The database parameters
*/
export async function acceptLicenseTermsAndAddREClusterDatabase(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    await acceptLicenseTerms();
    await addNewREClusterDatabase(databaseParameters);
    //Connect to DB
    await myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName ?? '');
}

/**
 * Accept License terms and add RE Cloud database
 * @param databaseParameters The database parameters
*/
export async function acceptLicenseTermsAndAddRECloudDatabase(databaseParameters: AddNewDatabaseParameters): Promise<void> {
    const searchTimeout = 60 * 1000; // 60 sec to wait database appearing
    const dbSelector = myRedisDatabasePage.dbNameList.withExactText(databaseParameters.databaseName ?? '');
    const startTime = Date.now();

    await acceptLicenseTerms();
    await addRedisDatabasePage.addRedisDataBase(databaseParameters);
    //Click for saving
    await t.click(addRedisDatabasePage.addRedisDatabaseButton);
    // Reload page until db appears
    do {
        await common.reloadPage();
    }
    while (!(await dbSelector.exists) && Date.now() - startTime < searchTimeout);
    await t.expect(myRedisDatabasePage.dbNameList.withExactText(databaseParameters.databaseName ?? '').exists).ok('The existence of the database', { timeout: 5000 });
    await myRedisDatabasePage.clickOnDBByName(databaseParameters.databaseName ?? '');
}

//Accept License terms
export async function acceptLicenseTerms(): Promise<void> {
    await t.maximizeWindow();
    await userAgreementPage.acceptLicenseTerms();
}

//Accept License terms and connect to the RedisStack database
export async function acceptLicenseAndConnectToRedisStack(): Promise<void> {
    await acceptLicenseTerms();
    //Connect to DB
    await t.click(myRedisDatabasePage.myRedisDBButton);
    await t.click(addRedisDatabasePage.connectToRedisStackButton);
}

//Clear database data
export async function clearDatabaseInCli(): Promise<void> {
    if (await cliPage.cliCollapseButton.exists === false) {
        await t.click(cliPage.cliExpandButton);
    }
    await t.typeText(cliPage.cliCommandInput, 'FLUSHDB');
    await t.pressKey('enter');
}

/**
 * Delete database
 * @param databaseName The database name
*/
export async function deleteDatabase(databaseName: string): Promise<void> {
    await t.click(myRedisDatabasePage.myRedisDBButton);
    if (await addRedisDatabasePage.addDatabaseButton.exists) {
        await myRedisDatabasePage.deleteDatabaseByName(databaseName);
    }
}

/**
 * Accept License terms and add database or connect to the Redis stask database
 * @param databaseParameters The database parameters
 * @param databaseName The database name
*/
export async function acceptTermsAddDatabaseOrConnectToRedisStack(databaseParameters: AddNewDatabaseParameters, databaseName: string): Promise<void> {
    if (await addRedisDatabasePage.addDatabaseButton.exists) {
        await acceptLicenseTermsAndAddDatabase(databaseParameters, databaseName);
    }
    else {
        await acceptLicenseAndConnectToRedisStack();
    }
}
