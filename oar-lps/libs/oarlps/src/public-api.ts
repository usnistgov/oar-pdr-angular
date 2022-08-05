/*
 * Public API Surface of oarlps
 */

// export * from './lib/oarlps.service';
// export * from './lib/oarlps.component';
export * from './lib/oarlps.module';
export * from './lib/frame/frame.module'
export * from './lib/frame/headbar.component';
export * from './lib/frame/footbar.component';
export * from './lib/frame/messagebar.component';
export * from './lib/frame/usermessage.service';
export * from './lib/landing/aboutdataset/aboutdataset.module';
export * from './lib/landing/aboutdataset/aboutdataset.component';
export * from './lib/landing/done/done.module';
export * from './lib/landing/done/done.component';

export * from './lib/landing/sections/sections.module';
export * from './lib/landing/sections/resourcedata.component';
export * from './lib/landing/sections/resourcedescription.component';
export * from './lib/landing/sections/resourceidentity.component';
export * from './lib/landing/sections/resourcemetadata.component';
export * from './lib/landing/sections/resourcerefs.component';

export * from './lib/landing/editcontrol/metadataupdate.service';
export * from './lib/landing/editcontrol/editcontrol.module';
export * from './lib/landing/editcontrol/editstatus.component';
export * from './lib/landing/editcontrol/editcontrol.component';
export * from './lib/landing/editcontrol/editstatus.service';
export * from './lib/landing/editcontrol/auth.service';
export * from './lib/landing/citation/citation.module';
export * from './lib/landing/citation/citation.component';
export * from './lib/landing/downloadstatus/downloadstatus.component';
export * from './lib/landing/metricsinfo/metricsinfo.component';
export * from './lib/landing/searchresult/searchresult.module';
export * from './lib/landing/searchresult/searchresult.component';
export * from './lib/landing/metrics-data';
export * from './lib/landing/nerdm.component';

export * from './lib/landing/topic/topic-popup/search-topics.component';
export * from './lib/landing/description/description-popup/description-popup.component';
export * from './lib/landing/author/author-popup/author-popup.component';
export * from './lib/landing/contact/contact-popup/contact-popup.component';
export * from './lib/landing/author/author.service';
export * from './lib/landing/author/author.module';

export * from './lib/landing/tools/tools.module';
export * from './lib/landing/tools/toolmenu.component';

export * from './lib/datacart/cart.service';
export * from './lib/datacart/datacart.module';
export * from './lib/datacart/cartstatus';
export * from './lib/datacart/cartconstants';
export * from './lib/datacart/datacart.component';
export * from './lib/datacart/datacart.routes';

export * from './lib/metrics/metrics';
export * from './lib/metrics/metrics.module';
export * from './lib/metrics/horizontal-barchart/horizontal-barchart.component';
export * from './lib/metrics/metrics.component';

export * from './lib/directives/directives.module';
export * from './lib/directives/modal.component';

export * from './lib/shared/taxonomy-list';
export * from './lib/shared/globals/globals';
export * from './lib/shared/shared.module';
export * from './lib/shared/combobox/combo-box.component';
export * from './lib/shared/ga-service/google-analytics.service';
export * from './lib/shared/metrics-service/metrics.service';
export * from './lib/shared/modal-service';
export * from './lib/shared/confirmation-dialog/confirmation-dialog.module';
export * from './lib/shared/confirmation-dialog/confirmation-dialog.component';

export * from './lib/errors/errors.module';
export * from './lib/errors/error';
export * from './lib/errors/internalerror.component';
export * from './lib/errors/notfound.component';

export * from './lib/landingAbout/landingAbout.module';
export * from './lib/landingAbout/landingAbout.component';

export * from './lib/form-can-deactivate/form-can-deactivate';
export * from './lib/can-deactivate/can-deactivate.guard';
export * from './lib/can-deactivate/component-can-deactivate';

export * from './lib/config/config.module';
export * from './lib/config/config';
export * from './lib/config/config.service';

export * from './lib/utils';

export * from './lib/nerdm/nerdm.module';
export * from './lib/nerdm/metadatatransfer-browser.module';
// export * from './lib/nerdm/metadatatransfer-server.module';
export * from './lib/nerdm/nerdm';
export * from './lib/nerdm/nerdm.service';
export * from './lib/nerdm/nerdmconversion.service';

export * from './environments/ienvironment';
export * from './environments/environment-impl';
// export * as envprod from './environments/environment.prod';

export * from './lib/shared/common-function/common-function.service';