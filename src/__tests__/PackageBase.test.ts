import fs from 'fs';
import path from 'path';

import PackageBase from '../core/PackageBase';

const base = {
  ...JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')),
};

describe('PackageBase', () => {
  it('Parse base', () => {
    const pkg = new PackageBase({ ...base, bin: './index.js' });

    expect(pkg.name).toBe(base.name);
    expect(pkg.author?.name).toBe('Daniil Ryazanov');
    expect(pkg.author?.email).toBe('kein@tagproject.ru');
    expect(pkg.toString()).toMatchSnapshot();
  });

  it('Parse shorts', () => {
    const pkg = new PackageBase({
      ...base,
      author: 'Barney Rubble <b@rubble.com> (http://barnyrubble.tumblr.com/)',
      bugs: { url: 'https://github.com/owner/project/issues', email: 'project@hostname.com' },
      funding: [
        { type: 'individual', url: 'http://example.com/donate' },
        'http://example.com/donateAlso',
        { type: 'patreon', url: 'https://www.patreon.com/my-account' },
      ],
      bin: { 'my-program': './path/to/program' },
      man: ['./man/foo.1', './man/bar.1'],
      repository: 'github:user/repo',
      dependencies: { foo: 'user/repo#feature/branch', bar: 'file:../foo/bar' },
      peerDependencies: { tea: '2.x', 'soy-milk': '1.2' },
      peerDependenciesMeta: { 'soy-milk': { optional: true } },
      bundledDependencies: ['super-streams'],
      os: ['darwin', 'linux'],
      engines: { npm: '~1.0.20' },
      cpu: ['!arm', '!mips'],
      workspaces: ['./packages/*'],
    });

    expect(pkg.author?.name).toBe('Barney Rubble');
    expect(pkg.author?.email).toBe('b@rubble.com');
    expect(pkg.author?.url).toBe('http://barnyrubble.tumblr.com/');
    expect(pkg.bugs?.url).toBe('https://github.com/owner/project/issues');
    expect(pkg.funding.size).toBe(3);
    expect(pkg.funding.has('http://example.com/donate')).toBeTruthy();
    expect(pkg.bin.get('my-program')).toBe('./path/to/program');
    expect(pkg.man?.size).toBe(2);
    expect(pkg.os?.size).toBe(2);
    expect(pkg.cpu?.size).toBe(2);
    expect(pkg.engines?.size).toBe(1);
    expect(pkg.dependencies?.size).toBe(2);
    expect(pkg.peerDependencies?.size).toBe(2);
    expect(pkg.peerDependenciesMeta.get('soy-milk')?.optional).toBeTruthy();
    expect(pkg.bundledDependencies?.size).toBe(1);
    expect(pkg.workspaces?.size).toBe(1);
    expect(pkg.toString()).toMatchSnapshot();

    console.log(pkg.toString());
  });
});
