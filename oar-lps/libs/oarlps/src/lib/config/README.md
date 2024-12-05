# ConfigModule

This module provides a specialized version of the common configuration
service for use with the Landing Page Service in its various forms.

Note that a previous version of this module featured a polymorphic
design with different implementations depending on whether the app was
running server-side or browser-side or in development mode, etc.  This
current implementation is now built on the common
`ConfigurationService` from the `oarng` library in which the
configuration data is retrieved from a static file in the assets
directory (which works in both server-side and browser-side
contexts).  Thus, retrieving the appropriate configuration and caching
it to the assets directory is now out-of-scope of the angular
application; this should be handled prior to starting the web (or
node) server used to deliver the application.

In this new implementation, `AppConfig` is an subclass of the common
`ConfigurationService` class that ensures type-safety for the
configuration data and provides default values for optional
parameters.  Most uses of `AppConfig` uses its `get()` function to
retrieve configuration values while specifying a default.  

