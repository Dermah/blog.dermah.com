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

```bash
# TALK

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

# First, from the DEV-999999 branch, lets make the branch for the second subtask.
git branch DEV-111111-cool-component-on-login
# This makes another branch that's the same as my DEV-999999 branch, but doesn't check
# it out. (i.e. you're still on the DEV-999999)

# And when I'm doing a complicated rebase I like to make a backup branch just in case
# i screw everything up
git branch backup/cool-component

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
# After that's done I'll go through here and only add that bit that I need
git commit
# This opens up the commit message in `vim`. You can press `i` to enter 'Insert Text'
# mode, type the commit message then press ESCAPE. To save the commit message, press
# `:` then type `w` for 'write to disk' and `q` for 'quit', then press ENTER.

# Now I've committed the bit I wanted. I still have working changes left over and I
# can't be bothered figuring out what to do with it, so I'll just stash it just in case
git stash
# If you want to look at what you have stashed:
git stash list
# Or look at the contents of your last stash:
git stash show -p

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

# Now I can delete my backup branch
git branch -D backup/cool-component
# And get rid of that that stash
git stash drop

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
# cherry-picking the commit on to my branch
git cherry-pick 893a8db72d54658040087a70afb3d7fa5bf5cc22
# Tada I rescued a stash from oblivion yey
```
