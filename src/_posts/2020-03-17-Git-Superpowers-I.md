---
title: Git Superpowers I – Lightning Talk 2020-03-17
layout: post
---

This is a lightning talk I gave at my work about using Git to give you superpowers. It was mostly a live command line demo, so it is presented here as a shell script with accompanying console output.

We’re going to learn to:

- commit only part of the changes in your working directory
- unzip one feature branch in to two feature branches
- recover lost commits and stashes

<!-- excerpt -->

<div class="columns">
  <div class="half-column">

```bash
#!/bin/bash
# lightning-talk.sh

# Say I'm a developer and I've got a JIRA ticket that says we have to
# improve the friendly language on the login page to make it more inviting.
# My JIRA ticket has two subtasks, the first one (DEV-999999-really-cool-component)
# is the task for creating the <Text> component because we don't have one of those yet.
# The second subtask (DEV-111111-cool-component-on-login) is to actually use the
# component on the login screen.
# In my git history, I currently have a bunch of commits on my DEV-999999 branch.
# Unfortunately I got carried away and also started the second ticket on this branch.
# As a courtesy to the reviewers, I am going to split this branch into two branches,
# one for each ticket. This will help reviewers by givving them smaller diffs to review.
# I've been pretty good at how I form my commits so far, so it should be a matter of
# unzipping those commits into each branch.
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
* [33mbe9779a1[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-999999-really-cool-component[m[33m)[m Fix a bug with the branding of the login screen
* [33mb735020f[m Bump all dependencies for the lols
* [33m2e055574[m Remove leg end
* [33m261cad18[m Fix bug in text component that limited developer choice
* [33m312a896f[m Use cool text component on the login screen
* [33m7c56fdbf[m Add a cool Text atom component
* [33mca77ced8[m Add git watch scripts
[31m|[m * [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spaces
[31m|[m * [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
[31m|[m[31m/[m
* [33m707f52ab[m DEV-3164 Button Component
* [33m85a31564[m DEV-9876 Slider Component
* [33ma7b6b05a[m DEV-2731 PSS info on profile page
* [33m49fee3a0[m DEV-1337 Protect login page from XSS
* [33m0a9eb838[m DEV-9877 New login screen
* [33m5fed9627[m DEV-6661 Switch from React to Vue
```

```shell-session
$ git status
On branch DEV-999999-really-cool-component
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	[31mmodified:   web-apps/README.md[m
	[31mmodified:   web-apps/src/profile/components/Availability/constants.js[m

no changes added to commit (use "git add" and/or "git commit -a")
```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# First, from the DEV-999999 branch, lets make the branch for the second subtask.
git branch DEV-111111-cool-component-on-login
# This makes another branch that's the same as my DEV-999999 branch, but doesn't check
# it out. (i.e. you're still on the DEV-999999)
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
* [33mbe9779a1[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-999999-really-cool-component[m[33m, [m[1;32mDEV-111111-cool-component-on-login[m[33m)[m Fix a bug with the branding of the login screen
* [33mb735020f[m Bump all dependencies for the lols
* [33m2e055574[m Remove leg end
* [33m261cad18[m Fix bug in text component that limited developer choice
* [33m312a896f[m Use cool text component on the login screen
* [33m7c56fdbf[m Add a cool Text atom component
* [33mca77ced8[m Add git watch scripts
[31m|[m * [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spaces
[31m|[m * [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
[31m|[m[31m/[m
* [33m707f52ab[m DEV-3164 Button Component
* [33m85a31564[m DEV-9876 Slider Component
* [33ma7b6b05a[m DEV-2731 PSS info on profile page
* [33m49fee3a0[m DEV-1337 Protect login page from XSS
* [33m0a9eb838[m DEV-9877 New login screen
* [33m5fed9627[m DEV-6661 Switch from React to Vue
```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# And when I'm doing a complicated rebase I like to make a backup branch just in case
# i screw everything up
git branch backup/cool-component
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
* [33mbe9779a1[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-999999-really-cool-component[m[33m, [m[1;32mbackup/cool-component[m[33m, [m[1;32mDEV-111111-cool-component-on-login[m[33m)[m Fix a bug with the branding of the login screen
* [33mb735020f[m Bump all dependencies for the lols
* [33m2e055574[m Remove leg end
* [33m261cad18[m Fix bug in text component that limited developer choice
* [33m312a896f[m Use cool text component on the login screen
* [33m7c56fdbf[m Add a cool Text atom component
* [33mca77ced8[m Add git watch scripts
[31m|[m * [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spaces
[31m|[m * [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
[31m|[m[31m/[m
* [33m707f52ab[m DEV-3164 Button Component
* [33m85a31564[m DEV-9876 Slider Component
* [33ma7b6b05a[m DEV-2731 PSS info on profile page
* [33m49fee3a0[m DEV-1337 Protect login page from XSS
* [33m0a9eb838[m DEV-9877 New login screen
* [33m5fed9627[m DEV-6661 Switch from React to Vue
```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# There have been commits to master since I last branched from there so I will rebase
# my DEV-999999 branch onto master to make sure it's up to date.
git rebase -i master
# That didn't work because I have working changes that haven't been committed yet.

# Lets see whats here:
git diff
# This opens up the current working changes in a program called `less`. You can scroll
# up and down with the arrow keys (or mousewheel if it's set up). You can search for
# text by pressing `/` then typing your search and pressing ENTER. You can quit by
# pressing `q`.

# Ok can partially commit the important changes that I want to keep, but stash the rest.
# To stage only the bits that I want, do:
git add -p
# This will enter patch add mode. You can type `y` to stage the 'hunk' that is shown to
# you, `n` to ignore it, `s` to split the hunk into smaller hunks, or `q` to quit.
# There's a little help thing you can read by typing `?`.
```

  </div>

  <div class="half-column">

```shell-session
$ git status
On branch DEV-999999-really-cool-component
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	[32mmodified:   web-apps/src/profile/components/Availability/constants.js[m

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	[31mmodified:   web-apps/README.md[m
	[31mmodified:   web-apps/src/profile/components/Availability/constants.js[m
```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# After that's done I'll go through here and only add that bit that I need
git commit
# This opens up the commit message in `vim`. You can press `i` to enter 'Insert Text'
# mode, type the commit message then press ESCAPE. To save the commit message, press
# `:` then type `w` for 'write to disk' and `q` for 'quit', then press ENTER.
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
* [33m1461723e[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-999999-really-cool-component[m[33m)[m Add weekday evening constant
* [33mbe9779a1[m[33m ([m[1;32mbackup/cool-component[m[33m, [m[1;32mDEV-111111-cool-component-on-login[m[33m)[m Fix a bug with the branding of the login screen
* [33mb735020f[m Bump all dependencies for the lols
* [33m2e055574[m Remove leg end
* [33m261cad18[m Fix bug in text component that limited developer choice
* [33m312a896f[m Use cool text component on the login screen
* [33m7c56fdbf[m Add a cool Text atom component
* [33mca77ced8[m Add git watch scripts
[31m|[m * [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spaces
[31m|[m * [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
[31m|[m[31m/[m
* [33m707f52ab[m DEV-3164 Button Component
* [33m85a31564[m DEV-9876 Slider Component
* [33ma7b6b05a[m DEV-2731 PSS info on profile page
* [33m49fee3a0[m DEV-1337 Protect login page from XSS
* [33m0a9eb838[m DEV-9877 New login screen

```

```shell-session
$ git status
On branch DEV-999999-really-cool-component
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	[31mmodified:   web-apps/README.md[m
	[31mmodified:   web-apps/src/profile/components/Availability/constants.js[m

no changes added to commit (use "git add" and/or "git commit -a")

```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# Now I've committed the bit I wanted. I still have working changes left over and I
# can't be bothered figuring out what to do with it, so I'll just stash it just in case
git stash
# If you want to look at what you have stashed:
git stash list
# Or look at the contents of your last stash:
git stash show -p
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
*   [33meb60d408[m[33m ([m[1;35mrefs/stash[m[33m)[m WIP on DEV-999999-really-cool-component: 1461723e Add weekday evening constant
[31m|[m[32m\[m
[31m|[m * [33m3026623e[m index on DEV-999999-really-cool-component: 1461723e Add weekday evening constant
[31m|[m[31m/[m
* [33m1461723e[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-999999-really-cool-component[m[33m)[m Add weekday evening constant
* [33mbe9779a1[m[33m ([m[1;32mbackup/cool-component[m[33m, [m[1;32mDEV-111111-cool-component-on-login[m[33m)[m Fix a bug with the branding of the login screen
* [33mb735020f[m Bump all dependencies for the lols
* [33m2e055574[m Remove leg end
* [33m261cad18[m Fix bug in text component that limited developer choice
* [33m312a896f[m Use cool text component on the login screen
* [33m7c56fdbf[m Add a cool Text atom component
* [33mca77ced8[m Add git watch scripts
[32m|[m * [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spaces
[32m|[m * [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
[32m|[m[32m/[m
* [33m707f52ab[m DEV-3164 Button Component
* [33m85a31564[m DEV-9876 Slider Component
* [33ma7b6b05a[m DEV-2731 PSS info on profile page
```

```shell-session
$ git status
On branch DEV-999999-really-cool-component
nothing to commit, working tree clean
```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# OK now I can actually rebase. I'm going to rebase the first ticket on to master and
# get rid of ('drop') the commits that are only for the second branch. I can just drop
# the second branches commits because I created the second branch before and it has all
# the commits it needs on it already.
git rebase -i master
# You're now editing the rebase to-do list in `vim`. you can delete lines by pressing
# `dd`, or you can edit the text by pressing `i`, and then ESCAPE when you're done.
# Note the useful commands git documents at the bottom of the file. We won't get in to
# it here but play around with it some time. You made a backup branch so it's all good.

# I don't need this first commit because it was a test. I can just delete the line (`dd`)
# to drop the commit from the final rebased branch.
# The second commit is a change to the component library. We want to keep that
# The third I can't remember. If we open up another terminal and check what was in it
# by copying and pasting the commit hash.
git show 312a896f
# You're viewing the diff in `less`. Press `q` to exit.

# Yep that's just a change in the web-app, we can drop that (`dd`).
# Keep the next one, drop the leg end one (`dd`)
# etc.
# Once you're done editing the to-do list, write it to disk and quit `vim` (`:wq`)
# Now see we have a branch that only has the component library commits and it comes off
# the latest master.
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
* [33mf0b7107e[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-999999-really-cool-component[m[33m)[m Add weekday evening constant
* [33m0ce503ff[m Fix bug in text component that limited developer choice
* [33md49c3882[m Add a cool Text atom component
* [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spacestabs instead of 3 spaces
* [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
[31m|[m *   [33meb60d408[m[33m ([m[1;35mrefs/stash[m[33m)[m WIP on DEV-999999-really-cool-component: 1461723e Add weekday evening constant
[31m|[m [32m|[m[33m\[m
[31m|[m [32m|[m * [33m3026623e[m index on DEV-999999-really-cool-component: 1461723e Add weekday evening constant
[31m|[m [32m|[m[32m/[m
[31m|[m * [33m1461723e[m Add weekday evening constant
[31m|[m * [33mbe9779a1[m[33m ([m[1;32mbackup/cool-component[m[33m, [m[1;32mDEV-111111-cool-component-on-login[m[33m)[m Fix a bug with the branding of the login screen
[31m|[m * [33mb735020f[m Bump all dependencies for the lols
[31m|[m * [33m2e055574[m Remove leg end
[31m|[m * [33m261cad18[m Fix bug in text component that limited developer choice
[31m|[m * [33m312a896f[m Use cool text component on the login screen
[31m|[m * [33m7c56fdbf[m Add a cool Text atom component
[31m|[m * [33mca77ced8[m Add git watch scripts
[31m|[m[31m/[m

```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# Now the trick is to rebase the DEV-111111 branch on top of the first one.
# You can do that by switching to the branch:
git checkout DEV-111111-cool-component-on-login
# Note how the HEAD has moved, that shows you where you are in the commit graph
# Now tell git to to rebase it on top of the first branch.
git rebase -i DEV-999999-really-cool-component
# Notice how the other commits that are already on the first branch are missing here.
# That's because the rebase command runs through all the changes and if something
# already exists, no changes need to be made and it drops the commit for you.
# So you only have commits relevant to the second branch in the to-do list.
# Run the rebase by writing and exiting (`:wq`)
# Now you can see the second branch on top there with only its relevant changes.
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
* [33mcb55dce4[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-111111-cool-component-on-login[m[33m)[m Fix a bug with the branding of the login screen
* [33m36d4449b[m Bump all dependencies for the lols
* [33m5ea9afce[m Remove leg end
* [33m140512bb[m Use cool text component on the login screen
* [33m544f9048[m Add git watch scripts
* [33mf0b7107e[m[33m ([m[1;32mDEV-999999-really-cool-component[m[33m)[m Add weekday evening constant
* [33m0ce503ff[m Fix bug in text component that limited developer choice
* [33md49c3882[m Add a cool Text atom component
* [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spacestabs instead of 3 spaces
* [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
[31m|[m *   [33meb60d408[m[33m ([m[1;35mrefs/stash[m[33m)[m WIP on DEV-999999-really-cool-component: 1461723e Add weekday evening constant
[31m|[m [32m|[m[33m\[m
[31m|[m [32m|[m * [33m3026623e[m index on DEV-999999-really-cool-component: 1461723e Add weekday evening constant
[31m|[m [32m|[m[32m/[m
[31m|[m * [33m1461723e[m Add weekday evening constant
[31m|[m * [33mbe9779a1[m[33m ([m[1;32mbackup/cool-component[m[33m)[m Fix a bug with the branding of the login screen
[31m|[m * [33mb735020f[m Bump all dependencies for the lols
```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# Now I can delete my backup branch
git branch -D backup/cool-component
# And get rid of that that stash
git stash drop
```

  </div>

  <div class="half-column">

```shell-session
$ git log --graph --oneline --all
* [33mcb55dce4[m[33m ([m[1;36mHEAD -> [m[1;32mDEV-111111-cool-component-on-login[m[33m)[m Fix a bug with the branding of the login screen
* [33m36d4449b[m Bump all dependencies for the lols
* [33m5ea9afce[m Remove leg end
* [33m140512bb[m Use cool text component on the login screen
* [33m544f9048[m Add git watch scripts
* [33mf0b7107e[m[33m ([m[1;32mDEV-999999-really-cool-component[m[33m)[m Add weekday evening constant
* [33m0ce503ff[m Fix bug in text component that limited developer choice
* [33md49c3882[m Add a cool Text atom component
* [33m733f3cc4[m[33m ([m[1;32mmaster[m[33m)[m DEV-2589 Switch from tabs to spacestabs instead of 3 spaces
* [33maaaae70b[m DEV-1212 Sort all imports in reverse alphabetical order
* [33m707f52ab[m DEV-3164 Button Component
* [33m85a31564[m DEV-9876 Slider Component
* [33ma7b6b05a[m DEV-2731 PSS info on profile page
* [33m49fee3a0[m DEV-1337 Protect login page from XSS
* [33m0a9eb838[m DEV-9877 New login screen
```

  </div>
</div>

<hr />

<div class="columns">
  <div class="half-column">

```bash
# And we're good! But an hour later I realise I had some really important documentation
# in that stash. But I dropped it and it's lost forever!
# Not really. Git rarely deletes anything. Dropping a stash just means it isn't
# connected to your commit graph anymore. It's still there... somewhere
# We just have to find it. We can try the reflog. Sometimes that's handy if you delete
# a branch like I just deleted my backup branch and it's still there
git reflog
# This gives you a log of all the reference changes that have happend, opened in `less`.
# You can navigate around or type `/` to search.

# In my case though, stashes aren't really on branches so they wont show up in the reflog.
# Instead I had to find a hairy looking command on Stack Overflow to get it back.
# It uses the fsck command to find all dangling commits in my local git repo like this:
git fsck --no-reflog | awk '/dangling commit/ {print $3}'
# Not useful on its own but if you pump it in to the git log command you can get all the
# log messages next to the commit hashes:
git log --graph --oneline --decorate --all $( git fsck --no-reflog | awk '/dangling commit/ {print $3}' )
# Look for commits that start with WIP because that's the convention the `git stash`
#  command uses
# You can do `git show <commit>` to find what's in the commit. Now I can get it back by
# cherry-picking (without committing) the commit on to my branch
git cherry-pick eb60d408 -n -m 1
# Tada I rescued a stash from oblivion yey
```

  </div>

  <div class="half-column">

```shell-session
$ git status
On branch DEV-111111-cool-component-on-login
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	[32mmodified:   web-apps/README.md[m
	[32mmodified:   web-apps/src/profile/components/Availability/constants.js[m


```

  </div>
</div>
