const path = require('node:path');
const compiler = require('./compiler.js');

async function readOutputFile(stats, filePath) {
  const outputFs = stats.compilation.compiler.outputFileSystem;
  const outputFilePath = path.join(stats.compilation.options.output.path, filePath);

  return outputFs.promises.readFile(outputFilePath, 'utf8');
}

test('Outputs valid .gltf', async () => {
  const stats = await compiler('./fixtures/cube.js', {
    options: {
      name: '[name].[hash:8].[ext]'
    }
  });
  expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot();

  const cubeSource = await readOutputFile(stats, 'cube.6a77dc81.gltf');
  expect(cubeSource).toMatchSnapshot();
});

test('Throws an error on invalid .gltf', async () => {
  expect.assertions(2);
  await compiler('./fixtures/cube-invalid.js', {
    options: {
      name: '[name].[hash:8].[ext]'
    }
  }).catch(errors => {
    expect(errors).toHaveLength(1);
    expect(errors[0].message.indexOf('Error: Invalid glTF file')).not.toBe(-1);
  });
});

test('Shares assets over multiple .gltf', async () => {
  const stats = await compiler('./fixtures/shared.js', {
    options: {
      name: '[name].[hash:8].[ext]'
    }
  });
  expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot();

  // Use "assets/cube.c86430a0.png"
  const cubeSource = await readOutputFile(stats, 'cube.6a77dc81.gltf');
  expect(cubeSource).toMatchSnapshot();

  // Also uses "assets/cube.c86430a0.png"
  const facesSource = await readOutputFile(stats, 'faces.80de93ce.gltf');
  expect(facesSource).toMatchSnapshot();
});

test('Outputs relative paths in the exported .gltf', async () => {
  const stats = await compiler('./fixtures/cube.js', {
    options: {
      name: 'assets/[name].[hash:8].[ext]'
    }
  });
  expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot();

  // Image URI is "cube.c86430a0.png" (same folder)
  const cubeSource = await readOutputFile(stats, 'assets/cube.6a77dc81.gltf');
  expect(cubeSource).toMatchSnapshot();
});

test('Outputs relative paths in the exported .gltf when a public path is used', async () => {
  const stats = await compiler('./fixtures/cube.js', {
    publicPath: 'https://website.com/',
    options: {
      name: 'shared/[name].[hash:8].[ext]'
    }
  });
  expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot();

  // Image URI should be the relative path "../assets/cube.c86430a0.png"
  const cubeSource = await readOutputFile(stats, 'shared/cube.6a77dc81.gltf');
  expect(cubeSource).toMatchSnapshot();
});

test('Outputs an inline .gltf inside the module when the option is used', async () => {
  const stats = await compiler('./fixtures/cube.js', {
    options: {
      inline: true,
      name: 'shared/[name].[hash:8].[ext]'
    }
  });
  expect(Object.keys(stats.compilation.assets).sort()).toMatchSnapshot();

  const { modules } = stats.toJson({ source: true });
  const outputModule = modules.find(module => module.name === './fixtures/assets/cube.gltf');

  // .gltf should be emitted in the module itself
  expect(outputModule.source).toMatchSnapshot();
});
