import styles from './styles.module.css'

import Orcamento from '../../../assets/home/sectionTwo/orcamento.png'
import Enviar from '../../../assets/home/sectionTwo/enviar.png'
import Imprimir from '../../../assets/home/sectionTwo/imprimir.png'
import Pecas from '../../../assets/home/sectionTwo/pecas.png'
import Decoracao from '../../../assets/home/sectionTwo/decoracao.png'
import Brinquedos from '../../../assets/home/sectionTwo/brinquedos.png'

function SectionTwo () {
    const cards = [
        {
            icon: Orcamento,
            title: "Solicite um Orçamento",
            description: "Tem um projeto em mente? Receba um orçamento rápido e personalizado.",
            button: "Solicitar Agora"
        },
        {
            icon: Enviar,
            title: "Envie seu Modelo 3D",
            description: "Já tem um arquivo? Faça o upload e escolha os detalhes da impressão.",
            button: "Enviar Modelo"
        },
        {
            icon: Imprimir,
            title: "Imprimir um Modelo Pronto",
            description: "Selecione um modelo da nossa galeria e receba impresso na sua casa.",
            button: "Escolher Modelo"
        },
        {
            icon: Pecas,
            title: "Peças Técnicas",
            description: "Encontre soluções precisas para projetos de engenharia e mecânica.",
            button: "Explorar Peças"
        },
        {
            icon: Decoracao,
            title: "Itens de Decoração",
            description: "Dê um toque criativo aos seus espaços com impressões personalizadas.",
            button: "Ver Modelos"
        },
        {
            icon: Brinquedos,
            title: "Brinquedos Criativos",
            description: "Modelos divertidos e educativos para todas as idades.",
            button: "Explorar Brinquedos"
        }
    ]
    return (
        <div className={styles.container}>
          <div className={styles.contentTitle}>
            <h3>Possuí um modelo próprio? Solicite um orçamento agora!</h3>
            <h4>Envie seu projeto e receba propostas personalizadas dos melhores fornecedores de impressão 3D.</h4>
          </div>

          <div className={styles.contentCards}>
            {cards.map((card, index) => (
              <div key={index} className={styles.card}>
                <img src={card.icon} alt={card.title} />
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button>{card.button}</button>
              </div>
            ))}
          </div>
        </div>
    )
}

export default SectionTwo