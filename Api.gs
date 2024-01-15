const BaseUrl = 'https://www.clever-tanken.de';
const DetailsUrl = BaseUrl + '/tankstelle_details/';

class GasPrices {
  constructor(superE5, diesel, superE10 = 0, superPlus = 0) {
    this.superE5 = superE5;
    this.diesel = diesel;
    this.superE10 = superE10;
    this.superPlus = superPlus;
  }
}

/**
 * Returns GasPrices object or undefined in case of an error
 */
function getPrices(gasStationId) {
  const id = parseInt(gasStationId);
  if (!isNaN(id)) {
    const gasStationUrl = DetailsUrl + id;
    const response = UrlFetchApp.fetch(gasStationUrl, {
      method: 'get',
      muteHttpExceptions: true
    });
    const responseCode = response.getResponseCode();
    console.log('URL: ' + gasStationUrl);
    console.log('Response code: ' + responseCode);

    if (responseCode == 200) {
      const content = response.getContentText().trim();
      const diesel = getCurrentPrice(content, 1);
      if (typeof diesel !== 'number' || diesel <= 0) {
        console.error(`getPrices: Diesel price: ${diesel}`);
      }
      const superE10 = getCurrentPrice(content, 2);
      if (typeof superE10 !== 'number' || superE10 <= 0) {
        console.error(`getPrices: Super E10 price: ${superE10}`);
      }
      const superE5 = getCurrentPrice(content, 3);
      if (typeof superE5 !== 'number' || superE5 <= 0) {
        console.error(`getPrices: Super E5 price: ${superE5}`);
      }
      const superPlus = getCurrentPrice(content, 4); 
      if (typeof superPlus !== 'number' || superPlus <= 0) {
        console.error(`getPrices: SuperPlus price: ${superPlus}`);
      }
      return new GasPrices(superE5, diesel, superE10, superPlus);
    } else {
      console.error(`getPrices: Content: ${response.getContentText()}`);
    }
  }
  return undefined;
}

/**
 * Type is a number.
 * 1 = Diesel
 * 2 = Super E10
 * 3 = Super E5
 * 4 = SuperPlus
 * 
 * Returns current price as float
 */
function getCurrentPrice(htmlContent, type) {
  if (typeof htmlContent === 'string' && htmlContent.trim())
  {
    if (type >= 1 && type <= 4) {
      const currentPriceSpan = `<span id="current-price-${type}">`;
      const startCurrentPriceSpan = htmlContent.indexOf(currentPriceSpan);
      const endCurrentPriceSpan = htmlContent.indexOf('</span>', startCurrentPriceSpan);

      const currentSuffixSup = `<sup id="suffix-price-${type}">`;
      const startCurrentSuffixSup = htmlContent.indexOf(currentSuffixSup);
      const endCurrentSuffixSup = htmlContent.indexOf('</sup>', startCurrentSuffixSup);

      return parseFloat(htmlContent.substring(startCurrentPriceSpan + currentPriceSpan.length, endCurrentPriceSpan) + htmlContent.substring(startCurrentSuffixSup + currentSuffixSup.length, endCurrentSuffixSup));
    }
    else {
      console.error(`getCurrentPrice: Wrong type parameter, must be a number between 1 and 4`);
    }
  }
  else {
    console.error(`getCurrentPrice: Wrong htmlContent parameter: ${htmlContent}`);
  }
}
