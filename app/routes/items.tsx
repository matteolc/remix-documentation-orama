import { useEffect, useState } from "react";
import { useEventSource } from "remix-utils/sse/react";

export default function Screen() {

    const [message, setMessage] = useState("");

    const stream = useEventSource(`/items/completion`, {
        event: "message",
    });

    useEffect(() => {
        if (!stream) return;
        setMessage(message + " " + stream);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stream]);

    return (
        <div>
            <div>{message}</div>
        </div>
    );
}
