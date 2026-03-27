const suicideKeywords = [
"suicide",
"kill myself",
"want to die",
"end my life",
"self harm",
"no reason to live",
"better off dead"
]

const detectSelfHarm = (message)=>{

    const lower = message.toLowerCase()

    for(const word of suicideKeywords){

        if(lower.includes(word)){
            return true
        }

    }

    return false
}

module.exports = detectSelfHarm