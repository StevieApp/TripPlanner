import { toBase64String } from '@angular/compiler/src/output/source_map';

export class Creds{
    ConsumerKey = 'xMWUIZdaaSwdN9GaieACukGc53I0BDwh';
    ConsumerSecret = 'nM3xnt512hMGrkV6';
    key = this.getkey();
    
    getkey(){
        return toBase64String(this.ConsumerKey + ':' + this.ConsumerSecret);
    }
}
