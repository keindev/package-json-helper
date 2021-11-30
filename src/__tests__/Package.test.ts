import Package from '../Package';
import { DependenciesMapProps } from '../types';

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
  author: {
    name: 'Barney Rubble',
    email: 'b@rubble.com',
    url: 'http://barnyrubble.tumblr.com/',
  },
  contributors: [
    {
      name: 'Barney Rubble',
      email: 'b@rubble.com',
      url: 'http://barnyrubble.tumblr.com/',
    },
  ],
  maintainers: [
    {
      name: 'Barney Rubble',
      email: 'b@rubble.com',
      url: 'http://barnyrubble.tumblr.com/',
    },
  ],
  funding: {
    type: 'individual',
    url: 'http://example.com/donate',
  },
  files: ['__tests__/*.*'],
  type: 'module',
  main: 'lib/index.js',
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
  author: 'Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)',
  contributors: ['Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)'],
  maintainers: ['Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)'],
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
};

describe('Package', () => {
  const pkgBase = new Package(base);
  const pkgAlternative = new Package(alternative);

  it('Parse base', () => {
    expect(pkgBase.toString()).toMatchSnapshot();
  });

  it('Parse alternative', () => {
    expect(pkgAlternative.scope).toBe('scope');
    expect(pkgAlternative.toString()).toMatchSnapshot();
  });

  it('Check missing dependencies', () => {
    expect(
      pkgBase.getMissingDependencies(DependenciesMapProps.Dependencies, ['foo', 'bar', 'zip', 'zap'])
    ).toMatchObject(['zip', 'zap']);
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
          ['thr', '^3.3.8 <3.4.x'],
        ])
      )
    ).toMatchObject(['foo', 'bar', 'boo']);
  });
});
