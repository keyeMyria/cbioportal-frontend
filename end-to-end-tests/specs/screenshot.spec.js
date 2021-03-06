var assert = require('assert');
var expect = require('chai').expect;
var waitForOncoprint = require('./specUtils').waitForOncoprint;
var goToUrlAndSetLocalStorage = require('./specUtils').goToUrlAndSetLocalStorage;
var assertScreenShotMatch = require('../lib/testUtils').assertScreenShotMatch;

const CBIOPORTAL_URL = process.env.CBIOPORTAL_URL.replace(/\/$/, "");

function runResultsTestSuite(){

    it('render the oncoprint', function(){
        waitForOncoprint();
        browser.pause(2000);
        var res = browser.checkElement('#oncoprint');
        assertScreenShotMatch(res);
    });

    // can't get it to pass reliably
    it.skip('igv_tab tab', function(){
        browser.click("[href='#igv_tab']");
        browser.waitForExist('#cnSegmentsFrame', 20000);
        var res = browser.checkElement('#igv_tab',{hide:['.qtip'] });
        assertScreenShotMatch(res);
    });

    it('cancer type summary', function(){
        browser.click("[href='#pancancer_study_summary']");
        browser.waitForVisible('[data-test="cancerTypeSummaryChart"]',10000);
        var res = browser.checkElement('#pancancer_study_summary', { hide:['.qtip'] });
        assertScreenShotMatch(res);
    });

    it('mutex tab', function(){
        browser.click("[href='#mutex']");
        var res = browser.checkElement('#mutex',{ hide:['.qtip'] });
        assertScreenShotMatch(res);
    });

    it('plots tab', function(){
        browser.click("[href='#plots']");
        browser.waitForExist('#plots-box svg',10000);
        var res = browser.checkElement('#plots', { hide:['.qtip'], misMatchTolerance:1 });
        assertScreenShotMatch(res);
    });

    it('mutation tab', function(){
        browser.click("[href='#mutation_details']");
        browser.waitForVisible('.borderedChart svg',20000);
        var res = browser.checkElement('#mutation_details',{hide:['.qtip'] });
        assertScreenShotMatch(res);
    });

    it('coexpression tab', function(){
        browser.click("[href='#coexp']");
        browser.waitForVisible('#coexp_table_div_KRAS',10000);
        var res = browser.checkElement('#coexp',{hide:['.qtip'] });
        assertScreenShotMatch(res);
    });

    it('survival tab', function(){
        browser.click("[href='#survival']");
        browser.waitForVisible('[data-test=SurvivalChart] svg',10000);
        var res = browser.checkElement('#survival');
        assertScreenShotMatch(res);
    });

    it('network tab', function(){
        browser.click("[href='#network']");
        browser.waitForVisible('#cytoscapeweb canvas',20000);
        var res = browser.checkElement("#network",{hide:['.qtip','canvas'] });
        assertScreenShotMatch(res);
    });

    it.skip('data_download tab', function(){
        browser.click("[href='#data_download']");
        //  browser.pause(1000);
        browser.waitForExist("#text_area_gene_alteration_freq",20000);
        browser.waitUntil(function(){ return browser.getValue("#text_area_gene_alteration_freq").length > 0 },20000);
        var res = browser.checkElement('#data_download',{hide:['.qtip'] });
        assertScreenShotMatch(res);
    });

}

describe('result page screenshot tests', function(){
    before(function(){
        var url = `${CBIOPORTAL_URL}/index.do?tab_index=tab_visualize&cancer_study_list=coadread_tcga_pub&cancer_study_id=coadread_tcga_pub&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=coadread_tcga_pub_mutations&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=coadread_tcga_pub_gistic&Z_SCORE_THRESHOLD=2.0&case_set_id=coadread_tcga_pub_nonhypermut&case_ids=&gene_list=KRAS+NRAS+BRAF&gene_set_choice=user-defined-list&Action=Submit&show_samples=false&`;
        goToUrlAndSetLocalStorage(url);
    });

    runResultsTestSuite()

});

describe("oncoprint screenshot tests", function() {
    it("hcc_inserm_fr_2015 with genes including TERT - it should show orange promoter mutations in TERT", function() {
        goToUrlAndSetLocalStorage(`${CBIOPORTAL_URL}/index.do?cancer_study_id=hcc_inserm_fr_2015&Z_SCORE_THRESHOLD=2.0&RPPA_SCORE_THRESHOLD=2.0&data_priority=0&case_set_id=hcc_inserm_fr_2015_sequenced&gene_list=SOX9%2520RAN%2520TNK2%2520EP300%2520PXN%2520NCOA2%2520AR%2520NRIP1%2520NCOR1%2520NCOR2%2520TERT&geneset_list=+&tab_index=tab_visualize&Action=Submit&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=hcc_inserm_fr_2015_mutations`);
        waitForOncoprint(10000);
        var res = browser.checkElement('#oncoprint');
        assertScreenShotMatch(res);
    });
    it("msk_impact_2017 with SOS1 - SOS1 should be not sequenced", function() {
        var url = `${CBIOPORTAL_URL}/index.do?cancer_study_id=msk_impact_2017&Z_SCORE_THRESHOLD=2&RPPA_SCORE_THRESHOLD=2&data_priority=0&case_set_id=msk_impact_2017_all&gene_list=SOS1&geneset_list=+&tab_index=tab_visualize&Action=Submit&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=msk_impact_2017_mutations&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=msk_impact_2017_cna`;
        goToUrlAndSetLocalStorage(url);
        waitForOncoprint(10000);
        var res = browser.checkElement("#oncoprint");
        assertScreenShotMatch(res);
    });
    it("msk_impact_2017 with ALK and SOS1 - SOS1 should be not sequenced", function() {
        var url = `${CBIOPORTAL_URL}/index.do?cancer_study_id=msk_impact_2017&Z_SCORE_THRESHOLD=2&RPPA_SCORE_THRESHOLD=2&data_priority=0&case_set_id=msk_impact_2017_all&gene_list=ALK%2520SOS1&geneset_list=+&tab_index=tab_visualize&Action=Submit&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=msk_impact_2017_mutations&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=msk_impact_2017_cna`;
        goToUrlAndSetLocalStorage(url);
        waitForOncoprint(10000);
        var res = browser.checkElement("#oncoprint");
        assertScreenShotMatch(res);
    });
});

describe("download tab screenshot tests", function() {
    it("download tab - msk_impact_2017 with ALK and SOS1 - SOS1 should be not sequenced", function() {
        var url = `${CBIOPORTAL_URL}/index.do?cancer_study_id=msk_impact_2017&Z_SCORE_THRESHOLD=2&RPPA_SCORE_THRESHOLD=2&data_priority=0&case_set_id=msk_impact_2017_all&gene_list=ALK%2520SOS1&geneset_list=+&tab_index=tab_visualize&Action=Submit&genetic_profile_ids_PROFILE_MUTATION_EXTENDED=msk_impact_2017_mutations&genetic_profile_ids_PROFILE_COPY_NUMBER_ALTERATION=msk_impact_2017_cna`;
        goToUrlAndSetLocalStorage(url);
        browser.click("[href='#data_download']");
        browser.waitForExist('[data-test="dataDownloadGeneAlterationTable"] tr > td > svg', 20000);
        var res = browser.checkElement('#data_download',{hide:['.qtip'] });
        assertScreenShotMatch(res);
    });
});

describe('patient view page screenshot test', function(){
    before(function(){
        var url = `${CBIOPORTAL_URL}/case.do#/patient?studyId=lgg_ucsf_2014&caseId=P04`;
        goToUrlAndSetLocalStorage(url);
    });

    it('patient view lgg_ucsf_2014 P04', function() {
        // find oncokb image
        var oncokbIndicator = $('[data-test="oncogenic-icon-image"]');
        oncokbIndicator.waitForExist(30000);
        // find vaf plot
        var vafPlot = $('.vafPlot');
        vafPlot.waitForExist(30000);

        var res = browser.checkElement('#mainColumn', {hide:['.qtip'] });
        assertScreenShotMatch(res);
    });
});

describe('study view screenshot test', function(){
    before(function(){
        var url = `${CBIOPORTAL_URL}/study.do?cancer_study_id=lgg_ucsf_2014`;
        goToUrlAndSetLocalStorage(url);
    });

    it('study view lgg_ucsf_2014', function() {
        // assume that when mutated genes header is loaded the full page is
        // done loading
        var mutatedGenesHeader = $('#chart-new-mutated_genes-chart-header');
        mutatedGenesHeader.waitForExist(30000);

        // give charts time to render
        browser.setViewportSize({ height: 1600, width: 1000 })
        browser.pause(5000);

        var res = browser.checkElement('#page_wrapper_table', {hide:['.qtip'] });
        assertScreenShotMatch(res);
    });
});

describe('result page tabs, loading from session id', function(){
    before(function(){
        var url = `${CBIOPORTAL_URL}/index.do?session_id=596f9fa3498e5df2e292bdfd`;
        goToUrlAndSetLocalStorage(url);
    });

    runResultsTestSuite();

});
