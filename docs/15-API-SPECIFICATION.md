# API Specification (OpenAPI 3.0)

## Overview

This document provides the complete OpenAPI 3.0 specification for the ChecklistApp REST API, including all endpoints, request/response schemas, authentication, and error handling.

## OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: ChecklistApp API
  description: Mobile-first cleaning checklist application with AI-powered features
  version: 1.0.0
  contact:
    name: API Support
    email: api@checklistapp.com
  license:
    name: Proprietary
    
servers:
  - url: https://api.checklistapp.com/v1
    description: Production server
  - url: https://staging-api.checklistapp.com/v1
    description: Staging server
  - url: http://localhost:3000/api
    description: Development server

tags:
  - name: Authentication
    description: User authentication and authorization
  - name: Users
    description: User management operations
  - name: Checklists
    description: Checklist CRUD operations
  - name: Tasks
    description: Task management within checklists
  - name: Photos
    description: Photo upload and management
  - name: AI
    description: Claude AI integration
  - name: Sync
    description: Offline sync operations
  - name: Analytics
    description: Analytics and reporting

security:
  - BearerAuth: []
  - ApiKeyAuth: []

paths:
  # Authentication Endpoints
  /auth/register:
    post:
      tags:
        - Authentication
      summary: Register new user
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          $ref: '#/components/responses/Conflict'

  /auth/login:
    post:
      tags:
        - Authentication
      summary: User login
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginRequest'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /auth/refresh:
    post:
      tags:
        - Authentication
      summary: Refresh access token
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refreshToken:
                  type: string
      responses:
        '200':
          description: Token refreshed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /auth/logout:
    post:
      tags:
        - Authentication
      summary: User logout
      responses:
        '204':
          description: Logout successful

  # User Endpoints
  /users/me:
    get:
      tags:
        - Users
      summary: Get current user profile
      responses:
        '200':
          description: User profile
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '401':
          $ref: '#/components/responses/Unauthorized'
    
    put:
      tags:
        - Users
      summary: Update user profile
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUserRequest'
      responses:
        '200':
          description: Profile updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  # Checklist Endpoints
  /checklists:
    get:
      tags:
        - Checklists
      summary: List all checklists
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: status
          in: query
          schema:
            type: string
            enum: [draft, active, completed, archived]
        - name: roomType
          in: query
          schema:
            type: string
            enum: [bedroom, bathroom, kitchen, living_room, office, other]
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of checklists
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChecklistListResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

    post:
      tags:
        - Checklists
      summary: Create new checklist
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateChecklistRequest'
      responses:
        '201':
          description: Checklist created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Checklist'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /checklists/{checklistId}:
    get:
      tags:
        - Checklists
      summary: Get checklist by ID
      parameters:
        - $ref: '#/components/parameters/checklistId'
      responses:
        '200':
          description: Checklist details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Checklist'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

    put:
      tags:
        - Checklists
      summary: Update checklist
      parameters:
        - $ref: '#/components/parameters/checklistId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateChecklistRequest'
      responses:
        '200':
          description: Checklist updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Checklist'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      tags:
        - Checklists
      summary: Delete checklist
      parameters:
        - $ref: '#/components/parameters/checklistId'
      responses:
        '204':
          description: Checklist deleted
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /checklists/{checklistId}/duplicate:
    post:
      tags:
        - Checklists
      summary: Duplicate checklist
      parameters:
        - $ref: '#/components/parameters/checklistId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: Name for the duplicated checklist
      responses:
        '201':
          description: Checklist duplicated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Checklist'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  # Task Endpoints
  /checklists/{checklistId}/tasks:
    get:
      tags:
        - Tasks
      summary: List tasks in checklist
      parameters:
        - $ref: '#/components/parameters/checklistId'
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in_progress, completed, skipped]
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

    post:
      tags:
        - Tasks
      summary: Add task to checklist
      parameters:
        - $ref: '#/components/parameters/checklistId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskRequest'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /checklists/{checklistId}/tasks/{taskId}:
    get:
      tags:
        - Tasks
      summary: Get task details
      parameters:
        - $ref: '#/components/parameters/checklistId'
        - $ref: '#/components/parameters/taskId'
      responses:
        '200':
          description: Task details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

    put:
      tags:
        - Tasks
      summary: Update task
      parameters:
        - $ref: '#/components/parameters/checklistId'
        - $ref: '#/components/parameters/taskId'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateTaskRequest'
      responses:
        '200':
          description: Task updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      tags:
        - Tasks
      summary: Delete task
      parameters:
        - $ref: '#/components/parameters/checklistId'
        - $ref: '#/components/parameters/taskId'
      responses:
        '204':
          description: Task deleted
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  /checklists/{checklistId}/tasks/{taskId}/complete:
    post:
      tags:
        - Tasks
      summary: Mark task as completed
      parameters:
        - $ref: '#/components/parameters/checklistId'
        - $ref: '#/components/parameters/taskId'
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                notes:
                  type: string
                photoIds:
                  type: array
                  items:
                    type: string
      responses:
        '200':
          description: Task completed
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  # Photo Endpoints
  /photos/upload:
    post:
      tags:
        - Photos
      summary: Upload photo
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - file
              properties:
                file:
                  type: string
                  format: binary
                checklistId:
                  type: string
                taskId:
                  type: string
                metadata:
                  type: object
                  properties:
                    location:
                      type: object
                      properties:
                        lat:
                          type: number
                        lng:
                          type: number
                    timestamp:
                      type: string
                      format: date-time
      responses:
        '201':
          description: Photo uploaded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Photo'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '413':
          description: File too large
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /photos/{photoId}:
    get:
      tags:
        - Photos
      summary: Get photo metadata
      parameters:
        - $ref: '#/components/parameters/photoId'
      responses:
        '200':
          description: Photo metadata
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Photo'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

    delete:
      tags:
        - Photos
      summary: Delete photo
      parameters:
        - $ref: '#/components/parameters/photoId'
      responses:
        '204':
          description: Photo deleted
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'

  # AI Endpoints
  /ai/analyze-photo:
    post:
      tags:
        - AI
      summary: Analyze photo with Claude AI
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - photoId
              properties:
                photoId:
                  type: string
                roomType:
                  type: string
                  enum: [bedroom, bathroom, kitchen, living_room, office, other]
                context:
                  type: string
                  description: Additional context for AI analysis
      responses:
        '200':
          description: AI analysis complete
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AIAnalysisResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '402':
          description: AI quota exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '503':
          description: AI service unavailable
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /ai/generate-checklist:
    post:
      tags:
        - AI
      summary: Generate checklist from description
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - description
              properties:
                description:
                  type: string
                  minLength: 10
                  maxLength: 500
                roomType:
                  type: string
                  enum: [bedroom, bathroom, kitchen, living_room, office, other]
                complexity:
                  type: string
                  enum: [basic, standard, detailed]
                  default: standard
      responses:
        '200':
          description: Checklist generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GeneratedChecklistResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '402':
          description: AI quota exceeded
        '503':
          description: AI service unavailable

  /ai/suggest-tasks:
    post:
      tags:
        - AI
      summary: Get AI task suggestions
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - checklistId
              properties:
                checklistId:
                  type: string
                currentTasks:
                  type: array
                  items:
                    type: string
                maxSuggestions:
                  type: integer
                  default: 5
                  maximum: 10
      responses:
        '200':
          description: Task suggestions
          content:
            application/json:
              schema:
                type: object
                properties:
                  suggestions:
                    type: array
                    items:
                      type: object
                      properties:
                        title:
                          type: string
                        description:
                          type: string
                        estimatedTime:
                          type: integer
                        priority:
                          type: string
                          enum: [low, medium, high]
                        confidence:
                          type: number
                          minimum: 0
                          maximum: 1
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'

  # Sync Endpoints
  /sync/push:
    post:
      tags:
        - Sync
      summary: Push offline changes
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SyncPushRequest'
      responses:
        '200':
          description: Sync successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SyncResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '409':
          description: Sync conflict
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SyncConflictResponse'

  /sync/pull:
    post:
      tags:
        - Sync
      summary: Pull latest changes
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                lastSyncTimestamp:
                  type: string
                  format: date-time
                deviceId:
                  type: string
      responses:
        '200':
          description: Changes retrieved
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SyncPullResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'

  # Analytics Endpoints
  /analytics/dashboard:
    get:
      tags:
        - Analytics
      summary: Get analytics dashboard data
      parameters:
        - name: startDate
          in: query
          schema:
            type: string
            format: date
        - name: endDate
          in: query
          schema:
            type: string
            format: date
        - name: groupBy
          in: query
          schema:
            type: string
            enum: [day, week, month]
            default: day
      responses:
        '200':
          description: Analytics data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalyticsDashboard'
        '401':
          $ref: '#/components/responses/Unauthorized'

  /analytics/export:
    post:
      tags:
        - Analytics
      summary: Export analytics data
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - format
              properties:
                format:
                  type: string
                  enum: [csv, json, pdf]
                startDate:
                  type: string
                  format: date
                endDate:
                  type: string
                  format: date
                includePhotos:
                  type: boolean
                  default: false
      responses:
        '200':
          description: Export ready
          content:
            application/json:
              schema:
                type: object
                properties:
                  downloadUrl:
                    type: string
                  expiresAt:
                    type: string
                    format: date-time
        '401':
          $ref: '#/components/responses/Unauthorized'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  parameters:
    checklistId:
      name: checklistId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    taskId:
      name: taskId
      in: path
      required: true
      schema:
        type: string
        format: uuid
    photoId:
      name: photoId
      in: path
      required: true
      schema:
        type: string
        format: uuid

  schemas:
    # Request Schemas
    RegisterRequest:
      type: object
      required:
        - email
        - password
        - name
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
        name:
          type: string
          minLength: 2
          maxLength: 50
        company:
          type: string
        role:
          type: string
          enum: [manager, supervisor, cleaner]

    LoginRequest:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
        deviceId:
          type: string
        remember:
          type: boolean

    UpdateUserRequest:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        company:
          type: string
        preferences:
          type: object
          properties:
            language:
              type: string
            theme:
              type: string
              enum: [light, dark, auto]
            notifications:
              type: object

    CreateChecklistRequest:
      type: object
      required:
        - name
        - roomType
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
          maxLength: 500
        roomType:
          type: string
          enum: [bedroom, bathroom, kitchen, living_room, office, other]
        templateId:
          type: string
        tasks:
          type: array
          items:
            $ref: '#/components/schemas/CreateTaskRequest'
        metadata:
          type: object

    UpdateChecklistRequest:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [draft, active, completed, archived]
        roomType:
          type: string
        metadata:
          type: object

    CreateTaskRequest:
      type: object
      required:
        - title
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 200
        description:
          type: string
          maxLength: 1000
        priority:
          type: string
          enum: [low, medium, high]
          default: medium
        estimatedTime:
          type: integer
          minimum: 1
          maximum: 480
        order:
          type: integer
        required:
          type: boolean
          default: true

    UpdateTaskRequest:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        status:
          type: string
          enum: [pending, in_progress, completed, skipped]
        priority:
          type: string
        estimatedTime:
          type: integer
        notes:
          type: string
        completedAt:
          type: string
          format: date-time

    SyncPushRequest:
      type: object
      required:
        - deviceId
        - changes
      properties:
        deviceId:
          type: string
        lastSyncTimestamp:
          type: string
          format: date-time
        changes:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              type:
                type: string
                enum: [create, update, delete]
              entity:
                type: string
                enum: [checklist, task, photo]
              data:
                type: object
              timestamp:
                type: string
                format: date-time

    # Response Schemas
    AuthResponse:
      type: object
      properties:
        user:
          $ref: '#/components/schemas/User'
        accessToken:
          type: string
        refreshToken:
          type: string
        expiresIn:
          type: integer

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
        company:
          type: string
        role:
          type: string
        avatar:
          type: string
        preferences:
          type: object
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Checklist:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        description:
          type: string
        roomType:
          type: string
        status:
          type: string
        progress:
          type: object
          properties:
            total:
              type: integer
            completed:
              type: integer
            percentage:
              type: number
        estimatedTime:
          type: integer
        actualTime:
          type: integer
        tasks:
          type: array
          items:
            $ref: '#/components/schemas/Task'
        metadata:
          type: object
        createdBy:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        completedAt:
          type: string
          format: date-time

    ChecklistListResponse:
      type: object
      properties:
        checklists:
          type: array
          items:
            $ref: '#/components/schemas/Checklist'
        pagination:
          $ref: '#/components/schemas/Pagination'

    Task:
      type: object
      properties:
        id:
          type: string
          format: uuid
        checklistId:
          type: string
        title:
          type: string
        description:
          type: string
        status:
          type: string
        priority:
          type: string
        estimatedTime:
          type: integer
        actualTime:
          type: integer
        order:
          type: integer
        required:
          type: boolean
        notes:
          type: string
        photos:
          type: array
          items:
            type: string
        completedBy:
          type: string
        completedAt:
          type: string
          format: date-time
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    Photo:
      type: object
      properties:
        id:
          type: string
          format: uuid
        url:
          type: string
        thumbnailUrl:
          type: string
        size:
          type: integer
        mimeType:
          type: string
        width:
          type: integer
        height:
          type: integer
        metadata:
          type: object
          properties:
            location:
              type: object
            timestamp:
              type: string
              format: date-time
            device:
              type: string
        checklistId:
          type: string
        taskId:
          type: string
        uploadedBy:
          type: string
        uploadedAt:
          type: string
          format: date-time

    AIAnalysisResponse:
      type: object
      properties:
        analysisId:
          type: string
        roomType:
          type: string
        confidence:
          type: number
        detectedIssues:
          type: array
          items:
            type: object
            properties:
              type:
                type: string
              severity:
                type: string
                enum: [low, medium, high]
              description:
                type: string
              location:
                type: object
                properties:
                  x:
                    type: number
                  y:
                    type: number
                  width:
                    type: number
                  height:
                    type: number
        suggestedTasks:
          type: array
          items:
            type: object
            properties:
              title:
                type: string
              priority:
                type: string
              estimatedTime:
                type: integer
              reason:
                type: string
        processedAt:
          type: string
          format: date-time

    GeneratedChecklistResponse:
      type: object
      properties:
        checklist:
          $ref: '#/components/schemas/Checklist'
        confidence:
          type: number
        alternativeSuggestions:
          type: array
          items:
            type: string

    SyncResponse:
      type: object
      properties:
        syncId:
          type: string
        status:
          type: string
          enum: [success, partial, failed]
        processed:
          type: integer
        failed:
          type: integer
        conflicts:
          type: array
          items:
            type: object
        serverTimestamp:
          type: string
          format: date-time

    SyncConflictResponse:
      type: object
      properties:
        conflicts:
          type: array
          items:
            type: object
            properties:
              entityId:
                type: string
              entityType:
                type: string
              localVersion:
                type: object
              serverVersion:
                type: object
              suggestedResolution:
                type: string
                enum: [keep_local, keep_server, merge]

    SyncPullResponse:
      type: object
      properties:
        changes:
          type: array
          items:
            type: object
        deletions:
          type: array
          items:
            type: object
            properties:
              entityId:
                type: string
              entityType:
                type: string
        serverTimestamp:
          type: string
          format: date-time
        hasMore:
          type: boolean

    AnalyticsDashboard:
      type: object
      properties:
        summary:
          type: object
          properties:
            totalChecklists:
              type: integer
            completedChecklists:
              type: integer
            averageCompletionTime:
              type: number
            totalTasks:
              type: integer
            completedTasks:
              type: integer
        trends:
          type: array
          items:
            type: object
            properties:
              date:
                type: string
                format: date
              checklists:
                type: integer
              tasks:
                type: integer
              completionRate:
                type: number
        topPerformers:
          type: array
          items:
            type: object
            properties:
              userId:
                type: string
              name:
                type: string
              completedChecklists:
                type: integer
              averageTime:
                type: number
        roomTypeBreakdown:
          type: object
          additionalProperties:
            type: object
            properties:
              count:
                type: integer
              averageTime:
                type: number

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        totalPages:
          type: integer
        hasNext:
          type: boolean
        hasPrevious:
          type: boolean

    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
        timestamp:
          type: string
          format: date-time
        path:
          type: string

  responses:
    BadRequest:
      description: Bad request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "BAD_REQUEST"
            message: "Invalid request parameters"
            details:
              field: "email"
              reason: "Invalid email format"

    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "UNAUTHORIZED"
            message: "Authentication required"

    Forbidden:
      description: Forbidden
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "FORBIDDEN"
            message: "Insufficient permissions"

    NotFound:
      description: Not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "NOT_FOUND"
            message: "Resource not found"

    Conflict:
      description: Conflict
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "CONFLICT"
            message: "Resource already exists"

    TooManyRequests:
      description: Too many requests
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "RATE_LIMITED"
            message: "Too many requests"
      headers:
        X-RateLimit-Limit:
          schema:
            type: integer
        X-RateLimit-Remaining:
          schema:
            type: integer
        X-RateLimit-Reset:
          schema:
            type: integer

    InternalServerError:
      description: Internal server error
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            code: "INTERNAL_ERROR"
            message: "An unexpected error occurred"
```

## API Usage Examples

### Authentication Flow

```bash
# 1. Register new user
curl -X POST https://api.checklistapp.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe",
    "role": "cleaner"
  }'

# Response
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "cleaner"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}

# 2. Use access token for authenticated requests
curl -X GET https://api.checklistapp.com/v1/checklists \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Creating a Checklist with AI

```bash
# 1. Generate checklist using AI
curl -X POST https://api.checklistapp.com/v1/ai/generate-checklist \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Deep clean master bedroom with focus on dust and allergens",
    "roomType": "bedroom",
    "complexity": "detailed"
  }'

# 2. Create checklist from AI response
curl -X POST https://api.checklistapp.com/v1/checklists \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Master Bedroom Deep Clean",
    "roomType": "bedroom",
    "tasks": [
      {
        "title": "Dust ceiling fan blades",
        "priority": "high",
        "estimatedTime": 10
      },
      {
        "title": "Vacuum under bed and furniture",
        "priority": "high",
        "estimatedTime": 15
      }
    ]
  }'
```

### Offline Sync Flow

```bash
# 1. Push offline changes
curl -X POST https://api.checklistapp.com/v1/sync/push \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "device-123",
    "lastSyncTimestamp": "2024-01-01T00:00:00Z",
    "changes": [
      {
        "id": "change-1",
        "type": "update",
        "entity": "task",
        "data": {
          "id": "task-123",
          "status": "completed"
        },
        "timestamp": "2024-01-01T10:00:00Z"
      }
    ]
  }'

# 2. Pull latest changes
curl -X POST https://api.checklistapp.com/v1/sync/pull \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lastSyncTimestamp": "2024-01-01T00:00:00Z",
    "deviceId": "device-123"
  }'
```

## Rate Limiting

API rate limits are enforced per user/API key:

| Tier | Requests/Minute | Requests/Hour | Requests/Day |
|------|----------------|---------------|--------------|
| Free | 60 | 1,000 | 10,000 |
| Basic | 120 | 3,000 | 30,000 |
| Pro | 300 | 10,000 | 100,000 |
| Enterprise | Custom | Custom | Custom |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Webhooks

Webhooks can be configured to receive real-time notifications:

```json
{
  "event": "checklist.completed",
  "data": {
    "checklistId": "123e4567-e89b-12d3-a456-426614174000",
    "completedAt": "2024-01-01T12:00:00Z",
    "completedBy": "user-123"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "signature": "sha256=..."
}
```

Available webhook events:
- `checklist.created`
- `checklist.completed`
- `checklist.deleted`
- `task.completed`
- `photo.uploaded`
- `ai.analysis.completed`
- `sync.conflict`

## SDK Support

Official SDKs are available for:
- JavaScript/TypeScript (npm: `@checklistapp/sdk`)
- Python (pip: `checklistapp-sdk`)
- Go (go get: `github.com/checklistapp/go-sdk`)
- Mobile (React Native, Flutter)

---

*Last Updated: December 2024*
*Version: 1.0.0*