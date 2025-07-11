<script>
    import Login from "./Login.svelte";
    import ChatMessage from "./ChatMessage.svelte";
    import { onMount } from "svelte";
    import { username, user, loginShekh } from "./user";
    import debounce from "lodash.debounce";

    import GUN from "gun";
    const db = GUN();

    let newMessage;
    let messages = [];

    let scrollBottom;
    let lastScrollTop;
    let canAutoScroll = true;
    let unreadMessages = false;

    function autoScroll() {
        setTimeout(
            () => scrollBottom?.scrollIntoView({ behavior: "auto" }),
            50
        );
        unreadMessages = false;
    }

    function watchScroll(e) {
        canAutoScroll = (e.target.scrollTop || Infinity) > lastScrollTop;
        lastScrollTop = e.target.scrollTop;
    }

    $: debouncedWatchScroll = debounce(watchScroll, 1000);

    onMount(async () => {
        await loginShekh(); // Automatically log in Shekh

        var match = {
            // lexical queries are kind of like a limited RegEx or Glob.
            ".": {
                // property selector
                ">": new Date(
                    +new Date() - 1 * 1000 * 60 * 60 * 3
                ).toISOString(), // find any indexed property larger ~3 hours ago
            },
            "-": 1, // filter in reverse
        };

        // Get Messages
        db.get("chat")
            .map(match)
            .once(async (data, id) => {
                if (data) {
                    // Key for end-to-end encryption
                    const key = "#foo";

                    var message = {
                        // transform the data
                        who: await db.user(data).get("alias"), // a user might lie who they are! So let the user system detect whose data it is.
                        what: (await SEA.decrypt(data.what, key)) + "", // force decrypt as text.
                        when: GUN.state.is(data, "what"), // get the internal timestamp for the what property.
                    };

                    if (message.what) {
                        messages = [...messages.slice(-100), message].sort(
                            (a, b) => a.when - b.when
                        );
                        if (canAutoScroll) {
                            autoScroll();
                        } else {
                            unreadMessages = true;
                        }

                        // Shekh's auto-reply logic
                        if (message.who !== 'shekh' && message.what.toLowerCase().includes('hello')) {
                            setTimeout(async () => {
                                const shekhReply = `Hello ${message.who}! This is Shekh. How can I help you?`;
                                const secretReply = await SEA.encrypt(shekhReply, "#foo");
                                const replyMessage = user.get("all").set({ what: secretReply });
                                const replyIndex = new Date().toISOString();
                                db.get("chat").get(replyIndex).put(replyMessage);
                            }, 1000);
                        }
                    }
                }
            });
    });

    async function sendMessage() {
        const secret = await SEA.encrypt(newMessage, "#foo");
        const message = user.get("all").set({ what: secret });
        const index = new Date().toISOString();
        db.get("chat").get(index).put(message);
        newMessage = "";
        canAutoScroll = true;
        autoScroll();
    }
</script>

<div class="container">
    {#if $username}
        <main on:scroll={debouncedWatchScroll} style="padding:0 1rem;">
            {#each messages as message (message.when)}
                <ChatMessage {message} sender={$username} />
            {/each}

            <div class="dummy" bind:this={scrollBottom} />
        </main>

        <form on:submit|preventDefault={sendMessage}>
            <input
                type="text"
                placeholder="Message..."
                bind:value={newMessage}
                maxlength="100"
                style="padding:0 1.5rem;"
            />

            <button
                type="submit"
                disabled={!newMessage}
                style="color:black;font-weight:700;font-size:1.4rem"
                >Send</button
            >
        </form>

        {#if !canAutoScroll}
            <div class="scroll-button">
                <button on:click={autoScroll} class:red={unreadMessages}>
                    {#if unreadMessages}
                        💬
                    {/if}

                    👇
                </button>
            </div>
        {/if}
    {:else}
        <main>
            <Login />
        </main>
    {/if}
</div>


