-- https://github.com/serilog/serilog-sinks-mssqlserver

CREATE TABLE [Diagnostics] (

   [Id] int IDENTITY(1,1) NOT NULL,
   [EventId] int NOT NULL,
   [Message] nvarchar(max) NULL,
   [MessageTemplate] nvarchar(max) NULL,
   [Level] nvarchar(128) NULL,
   [TimeStamp] datetimeoffset(7) NOT NULL,
   [Exception] nvarchar(max) NULL,
   [Properties] xml NULL,
   [LogEvent] nvarchar(max) NULL,
   [HttpRequestId] nvarchar(max) NULL,
   [UserName] nvarchar(max) NULL


   CONSTRAINT [PK_Diagnostics] 
     PRIMARY KEY CLUSTERED ([Id] ASC) 
     WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF,
           ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) 
     ON [PRIMARY]

) ON [PRIMARY];

CREATE TABLE [Performance] (

   [Id] int IDENTITY(1,1) NOT NULL,
   [EventId] int NOT NULL,
   [Message] nvarchar(max) NULL,
   [MessageTemplate] nvarchar(max) NULL,
   [Level] nvarchar(128) NULL,
   [TimeStamp] datetimeoffset(7) NOT NULL,
   [StartedTime] datetime2 NULL,
   [Exception] nvarchar(max) NULL,
   [Properties] xml NULL,
   [LogEvent] nvarchar(max) NULL,
   [HttpRequestId] nvarchar(max) NULL,
   [UserName] nvarchar(max) NULL,
   [OperationName] nvarchar(max) NULL,
   [OperationResult] nvarchar(max) NULL,
   [TimeTakenMsec] int NULL

   CONSTRAINT [PK_Performance] 
     PRIMARY KEY CLUSTERED ([Id] ASC) 
     WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF,
           ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) 
     ON [PRIMARY]

) ON [PRIMARY];

CREATE TABLE [Analytics] (

   [Id] int IDENTITY(1,1) NOT NULL,
   [EventId] int NOT NULL,
   [Message] nvarchar(max) NULL,
   [MessageTemplate] nvarchar(max) NULL,
   [Level] nvarchar(128) NULL,
   [TimeStamp] datetimeoffset(7) NOT NULL,
   [Exception] nvarchar(max) NULL,
   [Properties] xml NULL,
   [LogEvent] nvarchar(max) NULL,
   [HttpRequestId] nvarchar(max) NULL,
   [UserName] nvarchar(max) NULL


   CONSTRAINT [PK_Analytics] 
     PRIMARY KEY CLUSTERED ([Id] ASC) 
     WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF,
           ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) 
     ON [PRIMARY]

) ON [PRIMARY];