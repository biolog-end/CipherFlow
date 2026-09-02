/**
 * Built-in example schemes, embedded so they load from file:// as well as from a web server.
 * Keys are used by the help "Examples" section and by the welcome tutorial.
 */
const EXAMPLE_SCHEMES = {
    "simple-caesar": {
        nameKey: "help.example.simple_caesar",
        name: "Простой шифр Цезаря",
        description: "Базовая схема с шифром Цезаря. Отличная отправная точка для изучения.",
        nodes: [
            {
                id: "node_0",
                type: "input",
                x: 4595,
                y: 4880,
                values: {}
            },
            {
                id: "node_1",
                type: "caesar",
                x: 4865,
                y: 4880,
                values: {
                    shift: 3
                }
            },
            {
                id: "node_2",
                type: "output",
                x: 5135,
                y: 4880,
                values: {}
            }
        ],
        connections: [
            {
                id: "connection_0",
                from: {
                    node: "node_0",
                    port: "out"
                },
                to: {
                    node: "node_1",
                    port: "in"
                }
            },
            {
                id: "connection_1",
                from: {
                    node: "node_1",
                    port: "out"
                },
                to: {
                    node: "node_2",
                    port: "in"
                }
            }
        ]
    },
    "multilevel-encryption": {
        nameKey: "help.example.multilevel",
        name: "Многоуровневое шифрование",
        description: "Сложная схема с несколькими уровнями защиты: регистр → A1Z26 → морзе → кошачий код",
        nodes: [
            {
                id: "node_0",
                type: "input",
                x: 4190,
                y: 4880,
                values: {}
            },
            {
                id: "node_1",
                type: "case-transform",
                x: 4460,
                y: 4880,
                values: {
                    mode: "upper"
                }
            },
            {
                id: "node_2",
                type: "a1z26",
                x: 4730,
                y: 4880,
                values: {
                    language: "ru",
                    mode: "encode"
                }
            },
            {
                id: "node_3",
                type: "morse",
                x: 5000,
                y: 4880,
                values: {
                    mode: "encode",
                    supportYo: false
                }
            },
            {
                id: "node_4",
                type: "braille-cat",
                x: 5270,
                y: 4880,
                values: {
                    mode: "encode",
                    supportYo: false
                }
            },
            {
                id: "node_5",
                type: "output",
                x: 5540,
                y: 4880,
                values: {}
            }
        ],
        connections: [
            {
                id: "connection_0",
                from: {
                    node: "node_0",
                    port: "out"
                },
                to: {
                    node: "node_1",
                    port: "in"
                }
            },
            {
                id: "connection_1",
                from: {
                    node: "node_1",
                    port: "out"
                },
                to: {
                    node: "node_2",
                    port: "in"
                }
            },
            {
                id: "connection_2",
                from: {
                    node: "node_2",
                    port: "out"
                },
                to: {
                    node: "node_3",
                    port: "in"
                }
            },
            {
                id: "connection_3",
                from: {
                    node: "node_3",
                    port: "out"
                },
                to: {
                    node: "node_4",
                    port: "in"
                }
            },
            {
                id: "connection_4",
                from: {
                    node: "node_4",
                    port: "out"
                },
                to: {
                    node: "node_5",
                    port: "in"
                }
            }
        ]
    },
    "vigenere-with-secret": {
        nameKey: "help.example.vigenere_secret",
        name: "Шифр Виженера с секретным словом",
        description: "Демонстрирует использование шифра Виженера с секретным ключевым словом. Полиалфавитное шифрование высокой стойкости.",
        nodes: [
            {
                id: "node_0",
                type: "input",
                x: 4595,
                y: 4880,
                values: {}
            },
            {
                id: "node_1",
                type: "secret-word",
                x: 4595,
                y: 5070,
                values: {
                    keyword: "КРИПТОГРАФИЯ"
                }
            },
            {
                id: "node_2",
                type: "vigenere",
                x: 4865,
                y: 4975,
                values: {}
            },
            {
                id: "node_3",
                type: "output",
                x: 5135,
                y: 4975,
                values: {}
            }
        ],
        connections: [
            {
                id: "connection_0",
                from: {
                    node: "node_0",
                    port: "out"
                },
                to: {
                    node: "node_2",
                    port: "text"
                }
            },
            {
                id: "connection_1",
                from: {
                    node: "node_1",
                    port: "out"
                },
                to: {
                    node: "node_2",
                    port: "key"
                }
            },
            {
                id: "connection_2",
                from: {
                    node: "node_2",
                    port: "out"
                },
                to: {
                    node: "node_3",
                    port: "in"
                }
            }
        ]
    },
    "planet-enchanter": {
        nameKey: "help.example.planet",
        name: "Географическое шифрование",
        description: "Уникальный алгоритм превращения текста в GPS-координаты городов мира. Отлично подходит для квестов!",
        nodes: [
            {
                id: "node_0",
                type: "input",
                x: 4595,
                y: 4880,
                values: {}
            },
            {
                id: "node_1",
                type: "planet-enchanter",
                x: 4865,
                y: 4880,
                values: {
                    mode: "encode",
                    language: "ru"
                }
            },
            {
                id: "node_2",
                type: "output",
                x: 5135,
                y: 4880,
                values: {}
            }
        ],
        connections: [
            {
                id: "connection_0",
                from: {
                    node: "node_0",
                    port: "out"
                },
                to: {
                    node: "node_1",
                    port: "in"
                }
            },
            {
                id: "connection_1",
                from: {
                    node: "node_1",
                    port: "out"
                },
                to: {
                    node: "node_2",
                    port: "in"
                }
            }
        ]
    },
    "cat-morse": {
        nameKey: "help.example.cat_morse",
        name: "Забавный кошачий морзе",
        description: "Образовательный пример с превращением текста в кошачьи звуки. Идеально для обучения детей основам криптографии!",
        nodes: [
            {
                id: "node_0",
                type: "input",
                x: 4595,
                y: 4880,
                values: {}
            },
            {
                id: "node_1",
                type: "braille-cat",
                x: 4865,
                y: 4880,
                values: {
                    mode: "encode",
                    supportYo: false
                }
            },
            {
                id: "node_2",
                type: "output",
                x: 5135,
                y: 4880,
                values: {}
            }
        ],
        connections: [
            {
                id: "connection_0",
                from: {
                    node: "node_0",
                    port: "out"
                },
                to: {
                    node: "node_1",
                    port: "in"
                }
            },
            {
                id: "connection_1",
                from: {
                    node: "node_1",
                    port: "out"
                },
                to: {
                    node: "node_2",
                    port: "in"
                }
            }
        ]
    },
    "monitoring-chain": {
        nameKey: "help.example.monitoring",
        name: "Отладка с мониторами",
        description: "Демонстрирует использование нодов-мониторов для отслеживания промежуточных результатов в сложной цепочке шифрования.",
        nodes: [
            {
                id: "node_0",
                type: "input",
                x: 4325,
                y: 4880,
                values: {}
            },
            {
                id: "node_1",
                type: "numbers-to-words",
                x: 4595,
                y: 4880,
                values: {
                    language: "ru",
                    mode: "to_words"
                }
            },
            {
                id: "node_2",
                type: "monitor",
                x: 4865,
                y: 4690,
                values: {}
            },
            {
                id: "node_3",
                type: "caesar",
                x: 4865,
                y: 4880,
                values: {
                    shift: 7
                }
            },
            {
                id: "node_4",
                type: "monitor",
                x: 5135,
                y: 4690,
                values: {}
            },
            {
                id: "node_5",
                type: "reverse",
                x: 5135,
                y: 4880,
                values: {
                    mode: "words"
                }
            },
            {
                id: "node_6",
                type: "output",
                x: 5405,
                y: 4880,
                values: {}
            }
        ],
        connections: [
            {
                id: "connection_0",
                from: {
                    node: "node_0",
                    port: "out"
                },
                to: {
                    node: "node_1",
                    port: "in"
                }
            },
            {
                id: "connection_1",
                from: {
                    node: "node_1",
                    port: "out"
                },
                to: {
                    node: "node_2",
                    port: "in"
                }
            },
            {
                id: "connection_2",
                from: {
                    node: "node_1",
                    port: "out"
                },
                to: {
                    node: "node_3",
                    port: "in"
                }
            },
            {
                id: "connection_3",
                from: {
                    node: "node_3",
                    port: "out"
                },
                to: {
                    node: "node_4",
                    port: "in"
                }
            },
            {
                id: "connection_4",
                from: {
                    node: "node_3",
                    port: "out"
                },
                to: {
                    node: "node_5",
                    port: "in"
                }
            },
            {
                id: "connection_5",
                from: {
                    node: "node_5",
                    port: "out"
                },
                to: {
                    node: "node_6",
                    port: "in"
                }
            }
        ]
    }
};
