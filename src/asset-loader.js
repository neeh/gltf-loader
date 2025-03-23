
// https://github.com/webpack/webpack/issues/18928
module.exports = function assetLoader() {
  const url = this.utils.contextify(this.context, this.remainingRequest);
  return `module.exports = require(${JSON.stringify(url)});`;
};
