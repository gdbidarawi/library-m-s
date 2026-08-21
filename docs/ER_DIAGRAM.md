# Entity Relationship Diagram (Description)

> Paste this into draw.io / Lucidchart / a Mermaid renderer for your thesis appendix. A Mermaid ER diagram is included below and renders directly on GitHub.

```mermaid
erDiagram
    USER ||--o{ BORROW : "makes"
    USER ||--o{ FINE : "owes"
    USER ||--o{ NOTIFICATION : "receives"
    BOOK ||--o{ BORROW : "is borrowed in"
    BORROW ||--o| FINE : "may generate"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "admin | student"
        string registrationNumber UK
        string department
        string phone
        string address
        string photo
        boolean isVerified
        boolean isActive
        date createdAt
    }

    BOOK {
        ObjectId _id PK
        string title
        string isbn UK
        string author
        string publisher
        string category
        string edition
        string language
        string shelfNumber
        number quantity
        number available
        string image
        ObjectId addedBy FK
    }

    BORROW {
        ObjectId _id PK
        ObjectId student FK
        ObjectId book FK
        date requestDate
        date issueDate
        date dueDate
        date returnDate
        string status
        number renewCount
        ObjectId approvedBy FK
    }

    FINE {
        ObjectId _id PK
        ObjectId student FK
        ObjectId borrow FK
        number amount
        number daysLate
        string status "unpaid | paid"
        date paidDate
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string title
        string message
        string type
        boolean isRead
    }
```

## Relationship Summary
- One **User** (student) can have many **Borrow** records (1:N)
- One **Book** can appear in many **Borrow** records over time (1:N)
- One **Borrow** record generates at most one **Fine** (1:0..1) — only created if returned late
- One **User** can have many **Fines** (1:N) and many **Notifications** (1:N)
- **Admin** users create/manage Books, approve/reject Borrows, and mark Fines as paid
