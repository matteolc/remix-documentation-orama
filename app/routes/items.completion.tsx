import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { setTimeout as promiseTimeout } from "node:timers/promises";
import { setImmediate } from "node:timers";

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, function setup(send) {
    setImmediate(async () => {
      for (const message of ["this", "is", "a", "friendly", "message"]) {
        const res = await promiseTimeout(2000, { data: message });
        send(res);
      }
    });

    return function clear() {};
  });
}
