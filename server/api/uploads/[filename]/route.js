import { NextResponse } from "next/server"
import path from "path"
import fs from "fs"

// GET - Serve uploaded files
export async function GET(request, { params }) {
  try {
    const { filename } = params
    
    // For demo purposes, we'll return a placeholder response since files aren't actually uploaded
    // In a real application, you would serve files from your storage (local filesystem, AWS S3, etc.)
    
    console.log(`📁 Requested file: ${filename}`)
    
    // Check if it's an image file
    const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    
    if (isImage) {
      // Return a placeholder image response
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Document Viewer - ${filename}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 600px;
            }
            .icon {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              color: white;
              font-size: 30px;
            }
            h1 { color: #333; margin-bottom: 10px; }
            .filename { 
              background: #f8f9fa; 
              padding: 10px 20px; 
              border-radius: 10px; 
              font-family: monospace; 
              color: #666;
              margin: 20px 0;
            }
            .note {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
              margin-top: 20px;
            }
            .placeholder-img {
              width: 300px;
              height: 200px;
              background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px auto;
              color: #999;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📷</div>
            <h1>Document Image</h1>
            <div class="filename">${filename}</div>
            <div class="placeholder-img">
              Image Preview
            </div>
            <div class="note">
              <strong>Note:</strong> This is a demo placeholder. In a production environment, 
              the actual uploaded image would be displayed here. The file "${filename}" 
              was successfully uploaded by the service provider during verification.
            </div>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    } else {
      // Return a placeholder document response
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Document Viewer - ${filename}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 40px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 600px;
            }
            .icon {
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, #667eea, #764ba2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px;
              color: white;
              font-size: 30px;
            }
            h1 { color: #333; margin-bottom: 10px; }
            .filename { 
              background: #f8f9fa; 
              padding: 10px 20px; 
              border-radius: 10px; 
              font-family: monospace; 
              color: #666;
              margin: 20px 0;
            }
            .note {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
              margin-top: 20px;
            }
            .placeholder-doc {
              width: 300px;
              height: 200px;
              background: linear-gradient(45deg, #f8f9fa, #e9ecef);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px auto;
              color: #666;
              font-size: 18px;
              border: 2px dashed #dee2e6;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📄</div>
            <h1>Verification Document</h1>
            <div class="filename">${filename}</div>
            <div class="placeholder-doc">
              Document Preview
            </div>
            <div class="note">
              <strong>Note:</strong> This is a demo placeholder. In a production environment, 
              the actual uploaded document would be displayed here. The file "${filename}" 
              was successfully uploaded by the service provider during verification.
            </div>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      )
    }

  } catch (error) {
    console.error("❌ Error serving file:", error)
    return NextResponse.json({ 
      error: "File not found", 
      details: error.message 
    }, { status: 404 })
  }
}
