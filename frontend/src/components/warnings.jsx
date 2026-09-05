import { useState } from "react";

export function DetectCapsLock({children}){

    const [capsLockOn, setCapsLockOn] = useState(false);

    function handleKeyEvent(e){
        setCapsLockOn(e.getModifierState('CapsLock'));
    }

    function handleBlur(){
        setCapsLockOn(false);
    }

    return (<>
        <div onKeyDown={handleKeyEvent} onKeyUp={handleKeyEvent} onBlur={handleBlur}>{children}</div>
        {capsLockOn && (
            <div className="text-warning mt-2">
                <i className="bi bi-exclamation-triangle-fill me-1"/> Caps Lock is on.
            </div>
        )

        }
    </>);

}