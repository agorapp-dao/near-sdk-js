This is a patched version of `near-sdk-js` that is used in AgorApp online IDE.

Changes:

- We have exported type `NearVmEnv`, that allows us to mock the VM environment.
- We have changed the module system to Common.js, as AgorApp currently does not support ESM.

## How to release new version

```
pnpm i
pnpm run build

cd packages/near-sdk-js
pnpm pack

# Clone the repo to some other directory
git clone git@github.com:agorapp-dao/near-sdk-js.git
cd near-sdk-js
git checkout --orphan v2
git rm -rf .
# Copy the contents of the tarball generated by pnpm pack
git add .
git commit -am 'v2'
git push --set-upstream origin v2
```
