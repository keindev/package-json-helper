import Package from '../Package.js';
import { DependenciesMapProps, PackageDependency, PackageRestriction } from '../types.js';

const SAMPLE_NAME = 'Barney Rubble';
const SAMPLE_EMAIL = 'b@rubble.com';
const SAMPLE_URL = 'http://barnyrubble.tumblr.com/';

const base = {
  name: 'test',
  version: '1.0.1',
  description: 'package description',
  keywords: ['test', 'jest'],
  homepage: 'https://github.com/owner/project#readme',
  bugs: {
    url: 'https://github.com/owner/project/issues',
    email: 'project@hostname.com',
  },
  license: '(MIT OR Apache-2.0)',
  author: { name: SAMPLE_NAME, email: SAMPLE_EMAIL, url: SAMPLE_URL },
  contributors: [{ name: SAMPLE_NAME, email: SAMPLE_EMAIL, url: SAMPLE_URL }],
  maintainers: [{ name: SAMPLE_NAME, email: SAMPLE_EMAIL, url: SAMPLE_URL }],
  funding: {
    type: 'individual',
    url: 'http://example.com/donate',
  },
  files: ['__tests__/*.*'],
  type: 'module',
  main: 'lib/index.js',
  exports: './lib/index.js',
  types: 'lib/index.d.ts',
  bin: 'lib/index.js',
  man: './man/doc.1',
  directories: {
    lib: 'src/lib',
    bin: 'local/binaries',
    jars: 'java',
  },
  repository: {
    type: 'git',
    url: 'https://github.com/facebook/react.git',
    directory: 'packages/react-dom',
  },
  scripts: {
    prepare: 'command -o lib/ -c src/index.js',
    compress: '{{ run command to compress files }}',
  },
  config: {
    port: '8080',
  },
  dependencies: {
    foo: '1.0.0 - 2.9999.9999',
    bar: '>=1.0.2 <2.1.2',
    baz: '>1.0.2 <=2.3.4',
    boo: '2.0.1',
    qux: '<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0',
    asd: 'http://asdf.com/asdf.tar.gz',
    til: '~1.2',
    elf: '~1.2.3',
    two: '2.x',
    thr: '3.3.x',
    lat: 'latest',
    dyl: 'file:../dyl',
  },
  devDependencies: {
    'super-script': '~1.6.3',
  },
  peerDependencies: {
    tea: '2.x',
    'soy-milk': '1.2',
  },
  peerDependenciesMeta: {
    'soy-milk': {
      optional: true,
    },
  },
  bundledDependencies: ['render-blender', 'super-streams'],
  optionalDependencies: {
    'some-pkg': '1.x',
  },
  engines: {
    node: '>=0.10.3 <15',
  },
  os: ['darwin', 'linux', '!win32'],
  cpu: ['x64', 'ia32', '!arm'],
  publishConfig: {
    'allow-same-version': true,
  },
  workspaces: ['./packages/*'],
};

const alternative = {
  ...base,
  name: '@scope/package',
  private: true,
  bugs: {
    url: 'https://github.com/owner/project/issues',
  },
  license: 'SEE LICENSE IN LICENSE_FILE',
  author: `${SAMPLE_NAME} <${SAMPLE_EMAIL}> (${SAMPLE_URL})`,
  contributors: [`${SAMPLE_NAME} (${SAMPLE_URL})`],
  maintainers: [`${SAMPLE_NAME} <${SAMPLE_EMAIL}>`],
  funding: [
    {
      type: 'individual',
      url: 'http://example.com/donate',
    },
    'http://example.com/donateAlso',
    {
      type: 'patreon',
      url: 'https://www.patreon.com/my-account',
    },
  ],
  browser: 'lib/index.js',
  bin: {
    name: './path/to/program/index.js',
    shortname: './path/to/program/index.js',
  },
  man: ['./man/foo.1', './man/bar.1'],
  repository: 'gitlab:user/repo',
  exports: {
    node: {
      import: './feature-node.mjs',
      require: './feature-node.cjs',
    },
    './feature': {
      node: './feature-node.js',
      default: './feature.js',
    },
    default: './feature.mjs',
  },
  imports: {
    '#dep': {
      node: 'dep-node-native',
      default: './dep-polyfill.js',
    },
    '#internal/*': './src/internal/*.js',
  },
};

describe('Package', () => {
  const pkgBase = new Package(base);
  const pkgAlternative = new Package(alternative);
  const excludes = [
    // Package has exports, main will be excluded from output
    'main',
  ];

  it('Parse base', () => {
    const data = JSON.parse(pkgBase.toString());
    const keys = Object.keys(base).filter(key => !excludes.includes(key));

    keys.forEach(key => expect(key in data).toBeTruthy());

    expect(data).toMatchSnapshot();
  });

  it('Parse alternative', () => {
    const data = JSON.parse(pkgAlternative.toString());
    const keys = Object.keys(alternative).filter(key => !excludes.includes(key));

    keys.forEach(key => expect(key in data).toBeTruthy());

    expect(pkgAlternative.scope).toBe('scope');
    expect(data).toMatchSnapshot();
  });

  it('Check missing dependencies', () => {
    expect(
      pkgBase.getMissingDependencies(DependenciesMapProps.Dependencies, ['foo', 'bar', 'zip', 'zap'])
    ).toMatchObject(['zip', 'zap']);
  });

  it('Check Person variations', () => {
    const maintainer = pkgAlternative.maintainers.get(SAMPLE_NAME);
    const contributor = pkgAlternative.contributors.get(SAMPLE_NAME);

    expect(pkgBase.author?.name).toBe(SAMPLE_NAME);
    expect(pkgBase.author?.email).toBe(SAMPLE_EMAIL);
    expect(pkgBase.author?.url).toBe(SAMPLE_URL);

    expect(pkgAlternative.author?.name).toBe(SAMPLE_NAME);
    expect(pkgAlternative.author?.email).toBe(SAMPLE_EMAIL);
    expect(pkgAlternative.author?.url).toBe(SAMPLE_URL);

    expect(maintainer?.name).toBe(SAMPLE_NAME);
    expect(maintainer?.email).toBe(SAMPLE_EMAIL);
    expect(maintainer?.url).toBeUndefined();

    expect(contributor?.name).toBe(SAMPLE_NAME);
    expect(contributor?.email).toBeUndefined();
    expect(contributor?.url).toBe(SAMPLE_URL);
  });

  it('Check wrong version dependencies', () => {
    expect(
      pkgBase.getWrongVersionDependencies(
        DependenciesMapProps.Dependencies,
        new Map([
          ['foo', '>2.9999.9999'],
          ['bar', '4.x'],
          ['boo', '>1.0.2'],
          ['none', '1.x'],
          ['thr', '^3.3.x <3.4.x'],
        ])
      )
    ).toMatchObject(['foo', 'bar']);
  });

  it('Check dependencies changes', () => {
    const package1 = new Package({
      name: 'test',
      devDependencies: { 'dependency-1': '^15.0.5', 'dependency-2': '^0.9.0', 'dependency-3': '2.0.0' },
      engines: {
        node: '^14.13.1 || >=16.0.0',
      },
      os: ['darwin', 'linux'],
    });
    const package2 = new Package({
      name: 'test',
      devDependencies: { 'dependency-1': '^14.0.0', 'dependency-2': '^1.0.5', 'dependency-3': '2.0.0' },
      engines: {
        node: '>=14.0.0',
      },
      os: ['!win32', 'linux'],
    });

    expect(package1.getChanges(PackageDependency.DevDependencies, package2)).toMatchObject([
      {
        link: 'https://www.npmjs.com/package/dependency-1',
        name: 'dependency-1',
        type: 'bumped',
        value: {
          current: '^15.0.5',
          previous: '^14.0.0',
        },
      },
      {
        link: 'https://www.npmjs.com/package/dependency-2',
        name: 'dependency-2',
        type: 'downgraded',
        value: {
          current: '^0.9.0',
          previous: '^1.0.5',
        },
      },
    ]);
    expect(package1.getChanges(PackageDependency.Engines, package2)).toMatchObject([
      {
        link: undefined,
        name: 'node',
        type: 'changed',
        value: {
          current: '^14.13.1 || >=16.0.0',
          previous: '>=14.0.0',
        },
      },
    ]);
    expect(package1.getChanges(PackageRestriction.OS, package2)).toMatchObject([
      {
        name: 'darwin',
        type: 'added',
        value: {
          current: 'darwin',
          previous: undefined,
        },
      },
      {
        name: 'win32',
        type: 'removed',
        value: {
          previous: '!win32',
        },
      },
    ]);
  });

  it('Bump package version', () => {
    const pkg = new Package({ name: 'test', version: '1.0.0' });

    pkg.bump({ major: 1, minor: 1, patch: 1 });

    expect(pkg.version).toBe('2.0.0');

    pkg.bump({ minor: 1 });

    expect(pkg.version).toBe('2.1.0');

    pkg.bump({ patch: 1 });

    expect(pkg.version).toBe('2.1.1');
  });

  it('Create empty package', () => {
    let pkg;

    try {
      pkg = new Package({});
    } finally {
      expect(pkg instanceof Package).toBeDefined();
    }
  });
});
