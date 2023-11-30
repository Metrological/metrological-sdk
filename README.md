# Metrological SDK

[![npm version](https://badge.fury.io/js/@metrological%2Fsdk.svg)](https://badge.fury.io/js/@metrological%2Fsdk)

You can find the documentation for this project [here](https://sdk.metrological.com/#/)

The Metrological SDK contains several plugins and helpers that allow you to build TV apps and deploy them on the Metrological Platform.

The plugins in the Metrological SDK were previously an integral part of the [Lightning-SDK](https://github.com/rdkcentral/Lightning-SDK). Since version 5.0.0 of the Lightning-SDK they have been moved (forked) to their own repository and are fully maintained by the Metrological team, instead of the Lightning Open Source team.

For now, the Lightning-SDK still exports the Metrological and platform specific plugins from this repository. So from a developer perspective nothing changes while developing a Lightning App using the Lightning-SDK.

Check out the complete SDK [documentation](https://github.com/Metrological/metrological-sdk/blob/master/docs/index.md) for more info on each available plugin.

## Releasing

- Make sure you've got access to the `metrological` organization in NPM
- Run `npm login` to log into the NPM registry using the command line
- Version bump `package.json` and commit
- Update the [CHANGELOG](./CHANGELOG.md) and commit
- Create a tag in Github for the new version
- Run `npm run release`
- Inform the [Lightning-SDK](https://github.com/rdkcentral/Lightning-SDK) team about the change so they can update the dependency in their next release. Or better yet, submit a Pull Request ;-)

## Changelog

Check out the changelog [here](./CHANGELOG.md).
