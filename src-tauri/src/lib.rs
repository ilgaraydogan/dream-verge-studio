use tauri_plugin_store::StoreExt;

#[tauri::command]
fn set_api_key(app: tauri::AppHandle, service: String, key: String) -> Result<(), String> {
    println!("[STORE] Setting API key for service: {}", service);
    
    let store = app.store("api-keys.json")
        .map_err(|e| {
            let err_msg = format!("Failed to access store: {}", e);
            eprintln!("[STORE ERROR] {}", err_msg);
            err_msg
        })?;
    
    store.set(service.clone(), serde_json::json!(key));
    
    store.save()
        .map_err(|e| {
            let err_msg = format!("Failed to save store: {}", e);
            eprintln!("[STORE ERROR] {}", err_msg);
            err_msg
        })?;
    
    println!("[STORE] Successfully stored API key for service: {}", service);
    Ok(())
}

#[tauri::command]
fn get_api_key(app: tauri::AppHandle, service: String) -> Result<String, String> {
    println!("[STORE] Getting API key for service: {}", service);
    
    let store = app.store("api-keys.json")
        .map_err(|e| {
            let err_msg = format!("Failed to access store: {}", e);
            eprintln!("[STORE ERROR] {}", err_msg);
            err_msg
        })?;
    
    let value = store.get(service.clone())
        .ok_or_else(|| {
            let err_msg = format!("API key not found for service: {}", service);
            eprintln!("[STORE ERROR] {}", err_msg);
            err_msg
        })?;
    
    let key = value.as_str()
        .ok_or_else(|| "Invalid API key format".to_string())?;
    
    println!("[STORE] Successfully retrieved API key for service: {} (length: {})", service, key.len());
    Ok(key.to_string())
}

#[tauri::command]
fn delete_api_key(app: tauri::AppHandle, service: String) -> Result<(), String> {
    println!("[STORE] Deleting API key for service: {}", service);
    
    let store = app.store("api-keys.json")
        .map_err(|e| {
            let err_msg = format!("Failed to access store: {}", e);
            eprintln!("[STORE ERROR] {}", err_msg);
            err_msg
        })?;
    
    let deleted = store.delete(service.clone());
    if !deleted {
        println!("[STORE] API key not found for service: {}", service);
    }
    
    store.save()
        .map_err(|e| {
            let err_msg = format!("Failed to save store: {}", e);
            eprintln!("[STORE ERROR] {}", err_msg);
            err_msg
        })?;
    
    println!("[STORE] Successfully deleted API key for service: {}", service);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![set_api_key, get_api_key, delete_api_key])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
