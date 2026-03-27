const suicideKeywords = [
"suicide",
"kill myself",
"want to die",
"end my life",
"self harm",
"better off dead",
"no reason to live"
]

const detectKeywordRisk = (message)=>{

    const text = message.toLowerCase()

    for(const word of suicideKeywords){

        if(text.includes(word)){
            return 40
        }

    }

    return 0
}

module.exports = detectKeywordRisk