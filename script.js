const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById('gameSelect');
const questionIpt = document.getElementById('questionIpt');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById("aiResponse")
const form = document.querySelector('form');

// AIzaSyBjouHs6QiiFkl3au3EJMXp-rmmIVDJqOA
const askIa = async (question, game, apiKey) => {
    const model = 'gemini-2.5-flash'
    const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    // const userQuestion = question
    const contents = [{
        role: 'user',
        parts: [{
            text: `
            ## Especialidade
            Você é um especialista assistente de meta para o jogo ${game}
            
            ## Tarefa
            Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, build e dicas
            
            ## Regras
            - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta
            - Se a pergunta não está relacionada ao jogo, responda com
            'Essa pergunta não está relacionada ao jogo'
            - Considere a data atual ${new Date().toLocaleDateString()}
            - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente
            -Nunca responda itens que você não tenha certeza de que existe no patch atual            

            ## Resposta
            -Economize na respota, seja direto e responda no máximo 500 caracteres. 
            -Respoda em markdown
            - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo
            -Sempre que for fazer uma lista, use ul ao inves de ol

            ##Exeplo de resposta
            Pergunta do usuário: Melhor build para rengar jungle
            Resposta: A build mais atual é: \n\n **Itens**\n\n Coloque os itens aqui em lista.\n\n**Runas**\n\nExemplo de runas em lista\n\n**Skills**\n\nSequencia de skills em lista

            ---
            Aqui está a pergunda do usuário: ${question}
            `
        }]
    }]


    const tools = [{
        google_search: {}
    }]

    const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents,
            tools,
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

form.onsubmit = async (event) => {
    event.preventDefault()

    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionIpt.value

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        // perguntar para a IA
        const response = await askIa(question, game, apiKey)
        aiResponse.querySelector('.response-container').innerHTML = markdownToHTML(response)
        aiResponse.classList.remove('hidden')
        questionIpt.value = ''

    } catch (error) {
        console.log(error);
        alert('Não foi possivel fazer a busca pelo Gemini')

    } finally {
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
}