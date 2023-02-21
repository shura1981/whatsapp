cuando se instale ir a: node_modules/whatsapp-web.js/src/util/Injected.js

actualizar lo siguiente:

window.Store.Features = window.mR.findModule('FEATURE_CHANGE_EVENT')[0]?.LegacyPhoneFeatures;
window.Store.QueryExist = window.mR.findModule('queryExists')[0]?.queryExists;