# Level 1 — Foundations

**Focus:** Getting data in and out, and understanding how it's organized.

## Which of these scenarios can you handle confidently today?

- When a colleague asks me to pull specific data from the database, I can write a query that joins the right tables and filters to the correct result set.
  `SELECT` `JOIN` `INNER JOIN` `LEFT JOIN` `WHERE` `GROUP BY` `HAVING` `aliases` `subqueries`
- When I need to add a new field to the application, I can trace how the data model maps to database tables and understand which table needs to change.
  `JPA` `@Entity` `@Column` `@Table` `@ManyToOne` `@OneToMany` `Hibernate` `schema inspection`
- When I see a slow page or API endpoint, I can check the application logs to see what SQL the ORM is generating and spot obvious problems like N+1 queries.
  `N+1 queries` `Hibernate SQL logging` `spring.jpa.show-sql` `@Transactional` `FetchType.LAZY` `FetchType.EAGER`
- When I need to connect to our database to inspect data, I can get connected through Cloud SQL Auth Proxy or a database client without needing someone to walk me through it each time.
  `Cloud SQL Auth Proxy` `psql` `JDBC connection string` `IAM database authentication` `Cloud SQL instance connection name`
- When a colleague mentions indexes or transactions in a code review, I understand the concepts well enough to follow the conversation, even if I wouldn't make those decisions myself yet.
  `B-tree index` `PRIMARY KEY` `FOREIGN KEY` `COMMIT` `ROLLBACK` `ACID` `transaction isolation`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 2 engineers.
