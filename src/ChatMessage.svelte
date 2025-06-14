<script>
    export let message;
    export let sender;

    const messageClass = message.who === sender ? "sent" : "received";

    let avatar;
    if (message.who === 'shekh') {
        avatar = '/tom_dp.png';
    } else {
        avatar = '/jerry_dp.png';
    }

    const ts = new Date(message.when);
</script>

<div class={`message ${messageClass}`}>
    <img src={avatar} alt="avatar" style="padding:0.5rem" />
    <div class="message-text">
        <p style="margin-bottom:0.5rem;border-radius:1rem">{message.what}</p>

        <time>{ts.toLocaleTimeString()}</time>
    </div>
</div>


