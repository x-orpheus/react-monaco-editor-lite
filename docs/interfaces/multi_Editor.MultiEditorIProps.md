[@music/base-editor](../README.md) / [Modules](../modules.md) / [multi/Editor](../modules/multi_Editor.md) / MultiEditorIProps

# Interface: MultiEditorIProps

[multi/Editor](../modules/multi_Editor.md).MultiEditorIProps

## Table of contents

### Properties

- [defaultFiles](multi_Editor.MultiEditorIProps.md#defaultfiles)
- [defaultPath](multi_Editor.MultiEditorIProps.md#defaultpath)
- [defaultTheme](multi_Editor.MultiEditorIProps.md#defaulttheme)
- [ideConfig](multi_Editor.MultiEditorIProps.md#ideconfig)
- [options](multi_Editor.MultiEditorIProps.md#options)
- [title](multi_Editor.MultiEditorIProps.md#title)

### Methods

- [onFileChange](multi_Editor.MultiEditorIProps.md#onfilechange)
- [onFileSave](multi_Editor.MultiEditorIProps.md#onfilesave)
- [onPathChange](multi_Editor.MultiEditorIProps.md#onpathchange)
- [onRenameFile](multi_Editor.MultiEditorIProps.md#onrenamefile)
- [onValueChange](multi_Editor.MultiEditorIProps.md#onvaluechange)

## Properties

### defaultFiles

• `Optional` **defaultFiles**: [`filelist`](multi_Editor.filelist.md)

#### Defined in

multi/Editor.tsx:54

___

### defaultPath

• `Optional` **defaultPath**: `string`

#### Defined in

multi/Editor.tsx:47

___

### defaultTheme

• `Optional` **defaultTheme**: `string`

#### Defined in

multi/Editor.tsx:48

___

### ideConfig

• `Optional` **ideConfig**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `disableEslint?` | `boolean` |
| `disableFileOps?` | { `add?`: `boolean` ; `delete?`: `boolean` ; `rename?`: `boolean`  } |
| `disableFileOps.add?` | `boolean` |
| `disableFileOps.delete?` | `boolean` |
| `disableFileOps.rename?` | `boolean` |
| `disableFolderOps?` | { `add?`: `boolean` ; `delete?`: `boolean` ; `rename?`: `boolean`  } |
| `disableFolderOps.add?` | `boolean` |
| `disableFolderOps.delete?` | `boolean` |
| `disableFolderOps.rename?` | `boolean` |
| `disablePrettier?` | `boolean` |
| `disableSetting?` | `boolean` |
| `saveWhenBlur?` | `boolean` |

#### Defined in

multi/Editor.tsx:31

___

### options

• **options**: `IStandaloneEditorConstructionOptions`

#### Defined in

multi/Editor.tsx:55

___

### title

• `Optional` **title**: `string`

#### Defined in

multi/Editor.tsx:56

## Methods

### onFileChange

▸ `Optional` **onFileChange**(`key`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `string` |

#### Returns

`void`

#### Defined in

multi/Editor.tsx:51

___

### onFileSave

▸ `Optional` **onFileSave**(`key`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |
| `value` | `string` |

#### Returns

`void`

#### Defined in

multi/Editor.tsx:52

___

### onPathChange

▸ `Optional` **onPathChange**(`key`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `string` |

#### Returns

`void`

#### Defined in

multi/Editor.tsx:49

___

### onRenameFile

▸ `Optional` **onRenameFile**(`oldpath`, `newpath`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `oldpath` | `string` |
| `newpath` | `string` |

#### Returns

`void`

#### Defined in

multi/Editor.tsx:53

___

### onValueChange

▸ `Optional` **onValueChange**(`v`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `string` |

#### Returns

`void`

#### Defined in

multi/Editor.tsx:50
