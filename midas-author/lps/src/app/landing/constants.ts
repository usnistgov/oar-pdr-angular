export class LandingConstants {
    public static get editModes(): any { 
      return {
        EDIT_MODE: 'editMode',
        PREVIEW_MODE: 'previewMode',
        REVISE_MODE: 'revise',
        DONE_MODE: 'doneMode',
        VIEWONLY_MODE: 'viewOnlyMode',
        OUTSIDE_MIDAS_MODE: 'outsideMidasMode'
      }
    };

    public static get reviseType(): any { 
        return {
          MATADATA: 'metadata'
        }
      };  
}