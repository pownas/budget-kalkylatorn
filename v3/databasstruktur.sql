CREATE TABLE Users (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL
);

CREATE TABLE Accounts (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    OwnerId INTEGER,
    Balance REAL NOT NULL,
    FOREIGN KEY (OwnerId) REFERENCES Users(Id)
);

CREATE TABLE Categories (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Name TEXT NOT NULL,
    SplitA INTEGER NOT NULL, -- t.ex. 60 (procent för UserA)
    SplitB INTEGER NOT NULL  -- t.ex. 40 (procent för UserB)
);

CREATE TABLE Transactions (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    AccountId INTEGER NOT NULL,
    PayerId INTEGER NOT NULL,
    Amount REAL NOT NULL,
    CategoryId INTEGER NOT NULL,
    Date TEXT NOT NULL,
    Shared INTEGER NOT NULL, -- 1 = gemensam, 0 = individuell
    FOREIGN KEY (AccountId) REFERENCES Accounts(Id),
    FOREIGN KEY (PayerId) REFERENCES Users(Id),
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);