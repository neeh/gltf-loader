const path = require('node:path');
const loaderUtils = require('loader-utils');
const optionsSchema = require('./options.json');

const isDataURI = value => /^data:/i.test(value);

const assetLoaderPath_ = path.resolve(__dirname, 'asset-loader.js');

module.exports = async function loader(content) {
  const options = this.getOptions(optionsSchema);
  const context = options.context ?? this.context;
  const callback = this.async();

  let data;
  try {
    data = JSON.parse(content);
  } catch (err) {
    callback(new Error('Invalid glTF file: ' + err));
    return;
  }
  const assets = [
    ...(data.buffers ?? []),
    ...(data.images ?? [])
  ];

  const imports = [];

  const publicPath = this._compilation?.options?.output?.publicPath ?? '';
  const { inline = false } = options;
  // NOTE: Here we compute the URL BEFORE we even modify the content (intentional)
  const url = loaderUtils.interpolateName(this, options.name ?? '[contenthash].[ext]', {
    context,
    content,
    regExp: options.regExp
  });
  const baseUrl = path.dirname(url);

  await Promise.all(assets.map(async asset => {
    if (!loaderUtils.isUrlRequest(asset.uri)) return;

    if (isDataURI(asset.uri)) {
      this.emitWarning(new Error('Usage of data URIs inside glTF files are discouraged'));
      return;
    }

    const request = loaderUtils.urlToRequest(asset.uri, context);

    // https://github.com/webpack/webpack/issues/18928
    const assetLoaderPath = path.relative(this.context, assetLoaderPath_);
    const result = await this.importModule(`!!${assetLoaderPath}!${request}`);
    imports.push(`!!${assetLoaderPath}!${request}`);

    if (inline) {
      asset.uri = result;
    } else {
      asset.uri = path.relative(baseUrl, result.substr(publicPath.length));
    }
  }));

  const updatedContent = JSON.stringify(data);
  if (!inline) {
    this.emitFile(url, updatedContent);
  }

  const lines = imports.map(uri => `import ${JSON.stringify(uri)};`);
  if (inline) {
    lines.push('export default ' + updatedContent);
  } else {
    lines.push('export default __webpack_public_path__ + ' + JSON.stringify(url));
  }
  const source = lines.join('\n');

  callback(null, source);
};
