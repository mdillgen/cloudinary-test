# Investigate video player bug post-upgrade

The known client-side navigation quirk — blank dark box on `/` after navigating back from `/12` until hard refresh — stays out of scope for proactive fixing. After the Next.js 16 upgrade lands, we will reproduce the behavior and fix it only if the upgrade regresses or worsens it.

**Considered options**: Leave entirely untouched with no post-upgrade check; proactively fix during the upgrade.
