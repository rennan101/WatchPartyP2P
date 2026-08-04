// Inicializa o PeerJS utilizando o servidor público gratuito deles
const peer = new Peer();
let localStream = null;

// Elementos da interface
const myIdDisplay = document.getElementById('my-id');
const startShareBtn = document.getElementById('start-share');
const connectBtn = document.getElementById('connect-btn');
const hostIdInput = document.getElementById('host-id-input');
const videoPlayer = document.getElementById('video-player');

// 1. Quando conectar ao servidor, exibe o seu código único
peer.on('open', (id) => {
    myIdDisplay.innerText = id;
});

// 2. Ação do Botão: Você captura a sua tela e áudio
startShareBtn.addEventListener('click', async () => {
    try {
        // Pede permissão ao navegador para capturar tela + áudio
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        
        startShareBtn.innerText = "Tela capturada! Aguardando conexão...";
        startShareBtn.style.backgroundColor = "#4caf50"; // Fica verde
        
        // Coloca o seu próprio vídeo no player local para você ver o que está enviando (opcional)
        videoPlayer.srcObject = localStream;
        
    } catch (err) {
        console.error("Erro ao capturar tela:", err);
        alert("Não foi possível capturar a tela. Certifique-se de dar as permissões.");
    }
});

// 3. Você (Host) recebe uma conexão de dados avisando que o espectador chegou
peer.on('connection', (conn) => {
    conn.on('open', () => {
        // Assim que o espectador conecta, o Host LIGA para ele enviando o vídeo
        if (localStream) {
            peer.call(conn.peer, localStream);
        } else {
            alert("Sua esposa tentou conectar, mas você ainda não capturou a tela!");
        }
    });
});

// 4. Ação do Botão: Sua esposa (Espectador) insere o código e conecta
connectBtn.addEventListener('click', () => {
    const hostId = hostIdInput.value.trim();
    if (!hostId) {
        alert("Por favor, insira o código do transmissor.");
        return;
    }
    
    // Conecta via dados apenas para "bater na porta" do Host
    const conn = peer.connect(hostId);
    connectBtn.innerText = "Conectando...";
});

// 5. Sua esposa (Espectador) recebe a ligação do Host com o filme
peer.on('call', (call) => {
    // Atende a ligação (sem enviar nada de volta)
    call.answer();
    
    // Quando receber a transmissão, coloca na tag <video>
    call.on('stream', (remoteStream) => {
        videoPlayer.srcObject = remoteStream;
        
        // Tratamento para políticas de autoplay de navegadores (como Safari)
        videoPlayer.play().catch(error => {
            console.log("Autoplay bloqueado pelo navegador. O usuário precisa clicar no play.", error);
        });
        
        connectBtn.innerText = "Assistindo!";
        connectBtn.style.backgroundColor = "#4caf50";
    });
});