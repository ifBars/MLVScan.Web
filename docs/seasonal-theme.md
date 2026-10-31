# Seasonal treatment

Halloween replaces the floating background dots and connecting lines with small pumpkins,
bats and ghosts. The original colours, logo, typography, buttons and layout remain unchanged.
A small Happy Halloween label appears above the hero. Objects drift in the side margins,
brightening under a faint teal pointer flashlight. Touch devices omit the flashlight; narrow
screens show only the label. Reduced motion keeps the objects still and disables the flashlight.
There is no popup, sound, extra network request or telemetry event.

`VITE_HALLOWEEN_MODE` is a build-time setting:
- `auto` (default): active on October 31 using the visitor's local calendar, in any year.
- `off`: disable, including preview requests.
- `on`: force it on regardless of date.

After changing a build-time setting, rebuild and deploy. Automatic mode also updates an already
open tab at local midnight and when returning to a background tab; no manual switch is needed
on November 1. Development and staging builds support `?halloween=preview` to inspect it on
other dates. Production ignores that preview parameter. The dashboard is not themed.

The Happy Halloween pill toggles seasonal effects back to the regular particle background.
It remains visible during Halloween so effects can be restored. The browser saves this preference
in localStorage (`mlvscan:halloween-effects`, `on`/`off`), independently of diagnostics consent.
The preference is never sent to a server and survives deployments.
