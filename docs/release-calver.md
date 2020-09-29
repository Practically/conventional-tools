# Release Calver

The release Calver command is a way of managing project releases with calender
visioning. This visioning method suits its self well for rolling release and
where multiple versions of a page will not be installed. This is also good when
the "major", "minor" and "patch" version numbers don't make sense in your
release cycle.

The release process is:

1. Create and populate your `CHANGELOG.md`
2. Create a release commit
3. Create a release tag
4. Push to the remote
5. Create a Gitlab release

## Configuration

To configure your ci you will need to put a deployment token in to your
variables with the key of `CT_TOKEN`. The token will need write privileges to
the repository and access to the api to create your release.

Below is a example job you can put into your `.gitlab-ci.yaml`. It will create a
new release with every push to the master branch

```yaml
release:
  stage: release
  image: registry.baln.co.uk/general/conventional-tools:latest
  variables:
    GIT_EMAIL: gitbot@baln.co.uk
    GIT_USER: Gitbot
    GIT_STRATEGY: clone
  script:
    - git config --global user.email "$GIT_EMAIL"
    - git config --global user.name "$GIT_USER"
    - git checkout $CI_COMMIT_BRANCH
    - conventional-tools release-calver -s live
  only:
    - master
```

You can configure the version tag in your `.ctrc.yml`, this version method works
well with the tag prefix to scope your packages.

```yml
git:
  tagPrefix: '@'
  releaseScopes:
    - live
```

The above config will generate a release on the tag `live@2020.05.05` if you run
the command with the scope `stage` it will only create you a tag and release
commit and will not create a changelog or a Gitlab release because we have not
defined the `stage` scope in out `releaseScopes`

## Tag format

The base tag will be `YYYY.MM.DD` if you publish multiple releases in the same
day key will be appended with `-1` below is an example of publish 3 releases in
a day

- v2020.05.05
- v2020.05.05-1
- v2020.05.05-2

With a scope this will be

- live@2020.05.05
- live@2020.05.05-1
- live@2020.05.05-2