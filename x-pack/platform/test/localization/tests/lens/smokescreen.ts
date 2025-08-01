/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import expect from '@kbn/expect';
import { range } from 'lodash';
import { FtrProviderContext } from '../../ftr_provider_context';
import { getI18nLocaleFromServerArgs } from '../utils';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const { visualize, lens } = getPageObjects(['visualize', 'lens']);
  const find = getService('find');
  const listingTable = getService('listingTable');
  const testSubjects = getService('testSubjects');
  const elasticChart = getService('elasticChart');
  const filterBar = getService('filterBar');
  const retry = getService('retry');
  const config = getService('config');
  const browser = getService('browser');

  function getTranslationFr(term: string, field?: string, values: number = 3) {
    switch (term) {
      case 'legacyMetric':
        return 'Ancien indicateur';
      case 'datatable':
        return 'Tableau';
      case 'bar':
        return 'Vertical à barres';
      case 'line':
        return 'Ligne';
      case 'pie':
        return 'Camembert';
      case 'treemap':
        return 'Compartimentage';
      case 'heatmap':
        return 'Carte thermique';
      case 'Percent':
        return 'Pourcent';
      case 'Number':
        return 'Nombre';
      case 'Linear':
        return 'Linéaire';
      case 'Records':
        return 'Enregistrements';
      case 'records':
        return 'enregistrements';
      case 'moving_average':
        return 'Moyenne mobile de';
      case 'average':
        return field ? `Moyenne de ${field}` : `Moyenne`;
      case 'max':
        return field ? `Maximum de ${field}` : 'Maximum';
      case 'terms':
        return field
          ? `${values} valeurs les plus élevées de ${field}`
          : 'Valeurs les plus élevées';
      case 'sum':
        return 'somme';
      default:
        return term;
    }
  }

  function getTranslationJa(term: string, field?: string, values: number = 3) {
    switch (term) {
      case 'legacyMetric':
        return 'レガシーメトリック';
      case 'datatable':
        return '表';
      case 'bar':
        return '縦棒';
      case 'line':
        return '折れ線';
      case 'pie':
        return '円';
      case 'treemap':
        return 'ツリーマップ';
      case 'heatmap':
        return 'ヒートマップ';
      case 'Number':
        return '数字';
      case 'Percent':
        return '割合（%）';
      case 'Linear':
        return '線形';
      case 'Records':
      case 'records':
        return '記録';
      case 'moving_average':
        return 'の移動平均';
      case 'average':
        return field ? `${field} の平均` : `平均`;
      case 'max':
        return field ? `${field} の最高値` : '最高';
      case 'terms':
        return field ? `${field}の上位${values} の値` : 'トップの値';
      case 'sum':
        return '合計';
      default:
        return term;
    }
  }

  function getTranslationZh(term: string, field?: string, values: number = 3) {
    switch (term) {
      case 'legacyMetric':
        return '旧版指标';
      case 'datatable':
        return '表';
      case 'bar':
        return '垂直条形图';
      case 'line':
        return '折线图';
      case 'pie':
        return '饼图';
      case 'treemap':
        return '树状图';
      case 'heatmap':
        return '热图';
      case 'Number':
        return '数字';
      case 'Percent':
        return '百分比';
      case 'Linear':
        return '线性';
      case 'Records':
      case 'records':
        return '记录';
      case 'moving_average':
        return '的移动平均值';
      case 'average':
        return field ? `${field} 的平均值` : '平均值';
      case 'max':
        return field ? `${field} 的最大值` : '最大值';
      case 'terms':
        return field ? `${field} 的排名前 ${values} 的值` : `排名最前值`;
      case 'sum':
        return '求和';
      default:
        return term;
    }
  }

  function getTranslationDe(term: string, field?: string, values: number = 3) {
    switch (term) {
      case 'legacyMetric':
        return 'Legacy-Metrik';
      case 'datatable':
        return 'Tabelle';
      case 'bar':
        return 'Bar'; // 'Säulendiagramm'; Not translated yet.
      case 'line':
        return 'Zeile';
      case 'pie':
        return 'Torte';
      case 'treemap':
        return 'Treemap';
      case 'heatmap':
        return 'Heatmap';
      case 'Number':
        return 'Zahl';
      case 'Percent':
        return 'Prozent';
      case 'Linear':
        return 'Linear';
      case 'Records':
        return 'Aufzeichnungen';
      case 'records':
        return 'Einträge';
      case 'moving_average':
        return 'Gleitender Durchschnitt';
      case 'average':
        return field ? `Durchschnitt von ${field}` : `Durchschnitt`;
      case 'max':
        // return field ? `${field} Maximum` : 'Maximum';
        return field ? `Maximal ${field}` : 'Maximum';
      case 'terms':
        return field ? `Top ${values} values of ${field}` : 'Top values'; // Not translated yet
      case 'sum':
        return 'Summe';
      default:
        return term;
    }
  }

  function getExpectedI18nTranslator(locale: string): (term: string, field?: string) => string {
    switch (locale) {
      case 'ja-JP':
        return getTranslationJa;
      case 'zh-CN':
        return getTranslationZh;
      case 'fr-FR':
        return getTranslationFr;
      case 'de-DE':
        return getTranslationDe;
      default:
        return (v: string, field?: string) => v;
    }
  }

  describe('lens smokescreen tests', () => {
    let termTranslator: (term: string, field?: string, values?: number) => string;

    before(async () => {
      const serverArgs: string[] = config.get('kbnTestServer.serverArgs');
      const kbnServerLocale = getI18nLocaleFromServerArgs(serverArgs);
      termTranslator = getExpectedI18nTranslator(kbnServerLocale);
      await browser.setWindowSize(1600, 1000);
    });

    it('should allow creation of lens xy chart', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_splitDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: '@message.raw',
      });

      await lens.switchToVisualization('lnsDatatable', termTranslator('datatable'));
      await lens.removeDimension('lnsDatatable_rows');
      await lens.switchToVisualization('bar', termTranslator('bar'));

      await lens.configureDimension({
        dimension: 'lnsXY_splitDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'ip',
      });

      await lens.save('Afancilenstest');

      // Ensure the visualization shows up in the visualize list, and takes
      // us back to the visualization as we configured it.
      await visualize.gotoVisualizationLandingPage();
      await listingTable.searchForItemWithName('Afancilenstest');
      await lens.clickVisualizeListItemTitle('Afancilenstest');
      await lens.waitForVisualization('xyVisChart');

      expect(await lens.getTitle()).to.eql('Afancilenstest');

      // .echLegendItem__title is the only viable way of getting the xy chart's
      // legend item(s), so we're using a class selector here.
      // 4th item is the other bucket
      expect(await find.allByCssSelector('.echLegendItem')).to.have.length(4);
    });

    it('should create an xy visualization with filters aggregation', async () => {
      await visualize.gotoVisualizationLandingPage();
      await listingTable.searchForItemWithName('lnsXYvis');
      await lens.clickVisualizeListItemTitle('lnsXYvis');
      // Change the IP field to filters
      await lens.configureDimension({
        dimension: 'lnsXY_splitDimensionPanel > lns-dimensionTrigger',
        operation: 'filters',
        keepOpen: true,
      });
      await lens.addFilterToAgg(`geo.src : CN`);
      await lens.waitForVisualization('xyVisChart');

      // Verify that the field was persisted from the transition
      expect(await lens.getFiltersAggLabels()).to.eql([`"ip" : *`, `geo.src : CN`]);
      expect(await find.allByCssSelector('.echLegendItem')).to.have.length(2);
    });

    it('should transition from metric to table to metric', async () => {
      await visualize.gotoVisualizationLandingPage();
      await listingTable.searchForItemWithName('Artistpreviouslyknownaslens');
      await lens.clickVisualizeListItemTitle('Artistpreviouslyknownaslens');
      await lens.assertLegacyMetric(termTranslator('max', 'bytes'), '19,986');
      await lens.switchToVisualization('lnsDatatable', termTranslator('datatable'));
      expect(await lens.getDatatableHeaderText()).to.eql(termTranslator('max', 'bytes'));
      expect(await lens.getDatatableCellText(0, 0)).to.eql('19,986');
      await lens.switchToVisualization('lnsLegacyMetric', termTranslator('legacyMetric'));
      await lens.assertLegacyMetric(termTranslator('max', 'bytes'), '19,986');
    });

    it('should transition from a multi-layer stacked bar to a multi-layer line chart and correctly remove all layers', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      await lens.createLayer();

      expect(await lens.hasChartSwitchWarning('line', termTranslator('line'))).to.eql(false);

      await lens.switchToVisualization('line', termTranslator('line'));

      expect(await lens.getLayerType(0)).to.eql(termTranslator('line'));
      expect(await lens.getLayerType(1)).to.eql(termTranslator('bar'));

      await lens.configureDimension({
        dimension: 'lns-layerPanel-1 > lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'geo.src',
      });

      await lens.configureDimension({
        dimension: 'lns-layerPanel-1 > lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'machine.ram',
      });

      expect(await lens.getLayerCount()).to.eql(2);
      await lens.removeLayer();
      await lens.removeLayer();
      await testSubjects.existOrFail('workspace-drag-drop-prompt');
    });

    it('should transition selected layer in a multi layer bar using layer chart switch', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      await lens.createLayer('data', undefined, 'bar');
      expect(await lens.getLayerType(1)).to.eql(termTranslator('bar'));
      await lens.configureDimension({
        dimension: 'lns-layerPanel-1 > lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'geo.src',
      });

      await lens.configureDimension({
        dimension: 'lns-layerPanel-1 > lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'machine.ram',
      });

      // only changes one layer for compatible chart
      await lens.switchToVisualization('line', termTranslator('line'), 1);

      expect(await lens.getLayerType(0)).to.eql(termTranslator('bar'));
      expect(await lens.getLayerType(1)).to.eql(termTranslator('line'));

      // generates new one layer chart based on selected layer
      await lens.switchToVisualization('pie', termTranslator('pie'), 1);
      expect(await lens.getLayerType(0)).to.eql(termTranslator('pie'));
      const sliceByText = await lens.getDimensionTriggerText('lnsPie_sliceByDimensionPanel');
      const sizeByText = await lens.getDimensionTriggerText('lnsPie_sizeByDimensionPanel');

      expect(sliceByText).to.be(termTranslator('terms', 'geo.src', 5));
      expect(sizeByText).to.be(termTranslator('average', 'machine.ram'));
    });

    it('should edit settings of xy line chart', async () => {
      await visualize.gotoVisualizationLandingPage();
      await listingTable.searchForItemWithName('lnsXYvis');
      await lens.clickVisualizeListItemTitle('lnsXYvis');
      await lens.removeDimension('lnsXY_splitDimensionPanel');
      await lens.switchToVisualization('line', termTranslator('line'));
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
        operation: 'max',
        field: 'memory',
        keepOpen: true,
      });
      await lens.editDimensionLabel('Test of label');
      await lens.editDimensionFormat(termTranslator('Percent'));
      await lens.editDimensionColor('#ff0000');
      await lens.openVisualOptions();

      await lens.setCurvedLines('CURVE_MONOTONE_X');
      await lens.editMissingValues('Linear');

      await lens.assertMissingValues(termTranslator('Linear'));

      await lens.openDimensionEditor('lnsXY_yDimensionPanel > lns-dimensionTrigger');
      await lens.assertColor('#ff0000');

      await testSubjects.existOrFail('indexPattern-dimension-formatDecimals');

      await lens.closeDimensionEditor();

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.eql('Test of label');
    });

    it('should not show static value tab for data layers', async () => {
      await lens.openDimensionEditor('lnsXY_yDimensionPanel > lns-dimensionTrigger');
      // Quick functions and Formula tabs should be visible
      expect(await testSubjects.exists('lens-dimensionTabs-quickFunctions')).to.eql(true);
      expect(await testSubjects.exists('lens-dimensionTabs-formula')).to.eql(true);
      // Static value tab should not be visible
      expect(await testSubjects.exists('lens-dimensionTabs-static_value')).to.eql(false);

      await lens.closeDimensionEditor();
    });

    it('should be able to add very long labels and still be able to remove a dimension', async () => {
      await lens.openDimensionEditor('lnsXY_yDimensionPanel > lns-dimensionTrigger');
      const longLabel =
        'Veryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryveryvery long label wrapping multiple lines';
      await lens.editDimensionLabel(longLabel);
      await lens.waitForVisualization('xyVisChart');
      await lens.closeDimensionEditor();

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.eql(longLabel);
      expect(await lens.canRemoveDimension('lnsXY_yDimensionPanel')).to.equal(true);
      await lens.removeDimension('lnsXY_yDimensionPanel');
      await testSubjects.missingOrFail('lnsXY_yDimensionPanel > lns-dimensionTrigger');
    });

    it('should allow creation of a multi-axis chart and switching multiple times', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');
      await elasticChart.setNewChartUiDebugFlag(true);
      await lens.switchToVisualization('bar', termTranslator('bar'));

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'geo.dest',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'unique_count',
        field: 'bytes',
        keepOpen: true,
      });

      await lens.changeAxisSide('right');
      let data = await lens.getCurrentChartDebugState('xyVisChart');
      expect(data?.axes?.y.length).to.eql(2);
      expect(data?.axes?.y.some(({ position }) => position === 'right')).to.eql(true);

      await lens.changeAxisSide('left');
      data = await lens.getCurrentChartDebugState('xyVisChart');
      expect(data?.axes?.y.length).to.eql(1);
      expect(data?.axes?.y.some(({ position }) => position === 'right')).to.eql(false);

      await lens.changeAxisSide('right');
      await lens.waitForVisualization('xyVisChart');

      await lens.closeDimensionEditor();
    });

    it('should show value labels on bar charts when enabled', async () => {
      // enable value labels
      await lens.openTextOptions();
      await testSubjects.click('lns_valueLabels_inside');

      // check for value labels
      let data = await lens.getCurrentChartDebugState('xyVisChart');
      expect(data?.bars?.[0].labels).not.to.eql(0);

      // switch to stacked bar chart
      await lens.switchToVisualization('bar', termTranslator('bar'));

      // check for value labels
      data = await lens.getCurrentChartDebugState('xyVisChart');
      expect(data?.bars?.[0].labels).not.to.eql(0);
    });

    it('should override axis title', async () => {
      const axisTitle = 'overridden axis';
      await lens.toggleToolbarPopover('lnsLeftAxisButton');
      await testSubjects.setValue('lnsyLeftAxisTitle', axisTitle, {
        clearWithKeyboard: true,
      });

      let data = await lens.getCurrentChartDebugState('xyVisChart');
      expect(data?.axes?.y?.[1].title).to.eql(axisTitle);

      // hide the gridlines
      await testSubjects.click('lnsshowyLeftAxisGridlines');

      data = await lens.getCurrentChartDebugState('xyVisChart');
      expect(data?.axes?.y?.[1].gridlines.length).to.eql(0);
    });

    it('should transition from line chart to pie chart and to bar chart', async () => {
      await visualize.gotoVisualizationLandingPage();
      await listingTable.searchForItemWithName('lnsXYvis');
      await lens.clickVisualizeListItemTitle('lnsXYvis');
      expect(await lens.hasChartSwitchWarning('pie', termTranslator('pie'))).to.eql(true);
      await lens.switchToVisualization('pie', termTranslator('pie'));

      expect(await lens.getTitle()).to.eql('lnsXYvis');
      expect(await lens.getDimensionTriggerText('lnsPie_sliceByDimensionPanel')).to.eql(
        termTranslator('terms', 'ip')
      );
      expect(await lens.getDimensionTriggerText('lnsPie_sizeByDimensionPanel')).to.eql(
        termTranslator('average', 'bytes')
      );

      expect(await lens.hasChartSwitchWarning('bar', termTranslator('bar'))).to.eql(false);
      await lens.switchToVisualization('bar', termTranslator('bar'));
      expect(await lens.getTitle()).to.eql('lnsXYvis');
      expect(await lens.getDimensionTriggerText('lnsXY_splitDimensionPanel')).to.eql(
        termTranslator('terms', 'ip')
      );
      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.eql(
        termTranslator('average', 'bytes')
      );
    });

    it('should transition from bar chart to line chart', async () => {
      await visualize.gotoVisualizationLandingPage();
      await listingTable.searchForItemWithName('lnsXYvis');
      await lens.clickVisualizeListItemTitle('lnsXYvis');
      await lens.switchToVisualization('line', termTranslator('line'));
      expect(await lens.getTitle()).to.eql('lnsXYvis');
      expect(await lens.getDimensionTriggerText('lnsXY_xDimensionPanel')).to.eql('@timestamp');
      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.eql(
        termTranslator('average', 'bytes')
      );
      expect(await lens.getDimensionTriggerText('lnsXY_splitDimensionPanel')).to.eql(
        termTranslator('terms', 'ip')
      );
    });

    it('should transition from pie chart to treemap chart', async () => {
      await visualize.gotoVisualizationLandingPage();
      await listingTable.searchForItemWithName('lnsPieVis');
      await lens.clickVisualizeListItemTitle('lnsPieVis');
      expect(await lens.hasChartSwitchWarning('treemap', termTranslator('treemap'))).to.eql(false);
      await lens.switchToVisualization('treemap', termTranslator('treemap'));
      expect(await lens.getDimensionTriggersTexts('lnsPie_groupByDimensionPanel')).to.eql([
        termTranslator('terms', 'geo.dest', 7),
        termTranslator('terms', 'geo.src'),
      ]);
      expect(await lens.getDimensionTriggerText('lnsPie_sizeByDimensionPanel')).to.eql(
        termTranslator('average', 'bytes')
      );
    });

    it('should create a pie chart and switch to datatable', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');
      await lens.switchToVisualization('pie', termTranslator('pie'));
      await lens.configureDimension({
        dimension: 'lnsPie_sliceByDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
        disableEmptyRows: true,
      });

      await lens.configureDimension({
        dimension: 'lnsPie_sizeByDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      expect(await lens.hasChartSwitchWarning('lnsDatatable', termTranslator('datatable'))).to.eql(
        false
      );
      await lens.switchToVisualization('lnsDatatable', termTranslator('datatable'));

      // Need to provide a fn for these
      //   expect(await lens.getDatatableHeaderText()).to.eql('@timestamp per 3 hours');
      expect(await lens.getDatatableHeaderText(1)).to.eql(termTranslator('average', 'bytes'));
      expect(await lens.getDatatableCellText(0, 0)).to.eql('2015-09-20 00:00');
      expect(await lens.getDatatableCellText(0, 1)).to.eql('6,011.351');
    });

    it('should create a heatmap chart and transition to barchart', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');
      await lens.switchToVisualization('heatmap', termTranslator('heatmap'));

      await lens.configureDimension({
        dimension: 'lnsHeatmap_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });
      await lens.configureDimension({
        dimension: 'lnsHeatmap_yDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'geo.dest',
      });
      await lens.configureDimension({
        dimension: 'lnsHeatmap_cellPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      expect(await lens.hasChartSwitchWarning('bar', termTranslator('bar'))).to.eql(false);
      await lens.switchToVisualization('bar', termTranslator('bar'));
      expect(await lens.getDimensionTriggerText('lnsXY_xDimensionPanel')).to.eql('@timestamp');

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.contain('bytes');
    });

    it('should create a valid XY chart with references', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'moving_average',
        keepOpen: true,
      });
      await lens.configureReference({
        operation: termTranslator('sum'),
        field: 'bytes',
      });
      await lens.closeDimensionEditor();

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'cumulative_sum',
        keepOpen: true,
      });

      await lens.configureReference({
        field: termTranslator('Records'),
      });
      await lens.closeDimensionEditor();

      // Two Y axes that are both valid
      expect(await find.allByCssSelector('.echLegendItem')).to.have.length(2);
    });

    it('should allow formatting on references', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');
      await lens.switchToVisualization('lnsDatatable', termTranslator('datatable'));

      await lens.configureDimension({
        dimension: 'lnsDatatable_rows > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
        disableEmptyRows: true,
      });
      await lens.configureDimension({
        dimension: 'lnsDatatable_metrics > lns-empty-dimension',
        operation: 'moving_average',
        keepOpen: true,
      });
      await lens.configureReference({
        operation: termTranslator('sum'),
        field: 'bytes',
      });
      await lens.editDimensionFormat(termTranslator('Number'));
      await lens.closeDimensionEditor();

      await lens.waitForVisualization();

      const values = await Promise.all(
        range(0, 6).map((index) => lens.getDatatableCellText(index, 1))
      );
      expect(values).to.eql([
        '-',
        '222,420.00',
        '702,050.00',
        '1,879,613.33',
        '3,482,256.25',
        '4,359,953.00',
      ]);
    });

    /**
     * The edge cases are:
     *
     * 1. Showing errors when creating a partial configuration
     * 2. Being able to drag in a new field while in partial config
     * 3. Being able to switch charts while in partial config
     */
    it('should handle edge cases in reference-based operations', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'cumulative_sum',
      });
      expect(await lens.getWorkspaceErrorCount()).to.eql(1);

      await lens.removeDimension('lnsXY_xDimensionPanel');
      expect(await lens.getWorkspaceErrorCount()).to.eql(2);

      await lens.dragFieldToDimensionTrigger(
        '@timestamp',
        'lnsXY_xDimensionPanel > lns-empty-dimension'
      );
      expect(await lens.getWorkspaceErrorCount()).to.eql(1);

      expect(await lens.hasChartSwitchWarning('lnsDatatable', termTranslator('datatable'))).to.eql(
        false
      );
      await lens.switchToVisualization('lnsDatatable', termTranslator('datatable'));

      // TODO: fix this later on
      //   expect(await lens.getDimensionTriggerText('lnsDatatable_metrics')).to.eql(
      //     'Cumulative sum of (incomplete)'
      //   );
    });

    it('should keep the field selection while transitioning to every reference-based operation', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
        operation: 'counter_rate',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
        operation: 'cumulative_sum',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
        operation: 'differences',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
        operation: 'moving_average',
      });

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.contain('bytes');
    });

    it('should not leave an incomplete column in the visualization config with field-based operation', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'min',
      });

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.eql(undefined);
    });

    it('should revert to previous configuration and not leave an incomplete column in the visualization config with reference-based operations', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'moving_average',
        field: termTranslator('Records'),
      });

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.contain(
        termTranslator('moving_average')
      );

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
        operation: 'median',
        isPreviousIncompatible: true,
        keepOpen: true,
      });

      expect(await lens.isDimensionEditorOpen()).to.eql(true);

      await lens.closeDimensionEditor();

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.contain(
        termTranslator('moving_average')
      );
    });

    it('should transition from unique count to last value', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'unique_count',
        field: 'ip',
      });
      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
        operation: 'last_value',
        field: 'bytes',
        isPreviousIncompatible: true,
      });

      expect(await lens.getDimensionTriggerText('lnsXY_yDimensionPanel')).to.contain('bytes');
    });

    it('should allow to change index pattern', async () => {
      let indexPatternString;
      if (config.get('esTestCluster.ccs')) {
        indexPatternString = 'ftr-remote:log*';
      } else {
        indexPatternString = 'log*';
      }
      await lens.switchFirstLayerIndexPattern(indexPatternString);
      expect(await lens.getFirstLayerIndexPattern()).to.equal(indexPatternString);
    });

    it('should allow filtering by legend on an xy chart', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');

      await lens.configureDimension({
        dimension: 'lnsXY_xDimensionPanel > lns-empty-dimension',
        operation: 'date_histogram',
        field: '@timestamp',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      await lens.configureDimension({
        dimension: 'lnsXY_splitDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'extension.raw',
      });

      await lens.filterLegend('jpg');
      const hasExtensionFilter = await filterBar.hasFilter('extension.raw', 'jpg');
      expect(hasExtensionFilter).to.be(true);

      await filterBar.removeFilter('extension.raw');
    });

    it('should allow filtering by legend on a pie chart', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');
      await lens.switchToVisualization('pie', termTranslator('pie'));

      await lens.configureDimension({
        dimension: 'lnsPie_sliceByDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'extension.raw',
      });

      await lens.configureDimension({
        dimension: 'lnsPie_sliceByDimensionPanel > lns-empty-dimension',
        operation: 'terms',
        field: 'agent.raw',
      });

      await lens.configureDimension({
        dimension: 'lnsPie_sizeByDimensionPanel > lns-empty-dimension',
        operation: 'average',
        field: 'bytes',
      });

      await lens.filterLegend('jpg');
      const hasExtensionFilter = await filterBar.hasFilter('extension.raw', 'jpg');
      expect(hasExtensionFilter).to.be(true);

      await filterBar.removeFilter('extension.raw');
    });

    it('should show visual options button group for a pie chart', async () => {
      await visualize.navigateToNewVisualization();
      await visualize.clickVisType('lens');
      await lens.switchToVisualization('pie', termTranslator('pie'));

      const hasVisualOptionsButton = await lens.hasVisualOptionsButton();
      expect(hasVisualOptionsButton).to.be(true);

      await lens.openVisualOptions();
      await retry.try(async () => {
        expect(await lens.hasEmptySizeRatioButtonGroup()).to.be(true);
      });
    });
  });
}
