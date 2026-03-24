# reacciona
Proyecto Final académico ingeniería en sistemas


📐 Arquitectura del Sistema

```mermaid
graph TD
    subgraph Client_Layer
        A[Frontend / Postman]
    end

    subgraph API_Layer
        B[ProductController]
        C[GlobalExceptionHandler]
    end

    subgraph Application_Layer
        D[ProductService Interface]
        E[ProductServiceImpl]
        F[ProductResponseDTO - Record]
    end

    subgraph Domain_Layer
        G[Product Entity]
        H[ProductRepository]
    end

    subgraph Infrastructure_Layer
        I[(H2 In-Memory DB)]
    end

    A -->|GET /api/products/:id| B
    B --> D
    D --> E
    E --> F
    E --> H
    H --> I
    C -.->|Captura Errores| B
